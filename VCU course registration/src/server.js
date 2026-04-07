const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// =======================
// LOGIN ROUTES
// =======================

// Student login by student number
app.post('/login/student', async (req, res) => {
  try {
    const { studentNumber } = req.body;

    if (!studentNumber) {
      return res.status(400).json({ error: 'Student number is required' });
    }

    const student = await prisma.student.findUnique({
      where: { studentNumber }
    });

    if (!student) {
      return res.status(404).json({ error: 'Invalid student number' });
    }

    res.json({
      message: 'Student login successful',
      user: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentNumber,   // frontend reads studentId
        studentNumber: student.studentNumber,
        homeCountry: student.homeCountry,
        virginiaResident: student.virginiaResident,
        role: 'student'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Instructor login by email
app.post('/login/instructor', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Instructor email is required' });
    }

    const instructor = await prisma.instructor.findUnique({
      where: { email },
      include: { department: true }
    });

    if (!instructor) {
      return res.status(404).json({ error: 'Invalid instructor email' });
    }

    res.json({
      message: 'Instructor login successful',
      user: {
        id: instructor.id,
        instructorId: instructor.id,        // frontend reads instructorId
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email,
        department: instructor.department?.name || instructor.department?.departmentName || '',
        role: 'instructor'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// =======================
// DEPARTMENTS
// =======================

// Get all departments — used by course search filter dropdown
app.get('/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });

    // Normalize to a consistent shape regardless of schema field names
    const formatted = departments.map(d => ({
      id: d.id,
      departmentId: d.code || d.departmentId || d.id,
      departmentName: d.name || d.departmentName,
      school: d.school || d.departmentSchool || null
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// =======================
// COURSES
// =======================

// Get all courses, with optional department filter
app.get('/courses', async (req, res) => {
  try {
    const { department } = req.query;

    const courses = await prisma.course.findMany({
      where: department
        ? { department: { code: department } }
        : {},
      include: {
        department: true,
        sessions: {
          include: {
            instructor: true,
            enrollments: true
          }
        }
      }
    });

    const formatted = courses.map(course => ({
      ...course,
      sessions: course.sessions.map(session => ({
        ...session,
        enrolledCount: session.enrollments.length,
        remainingSeats: session.maxCapacity - session.enrollments.length
      }))
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get single course by ID
app.get('/courses/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        department: true,
        sessions: {
          include: {
            instructor: true,
            enrollments: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.sessions = course.sessions.map(session => ({
      ...session,
      enrolledCount: session.enrollments.length,
      remainingSeats: session.maxCapacity - session.enrollments.length
    }));

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// =======================
// SESSIONS
// =======================

// Get all sessions with optional search filters
// Supports: ?q=keyword  ?department=INFO  (used by course search page)
app.get('/sessions', async (req, res) => {
  try {
    const { q, department } = req.query;

    const sessions = await prisma.session.findMany({
      include: {
        course: {
          include: { department: true }
        },
        instructor: true,
        enrollments: true
      }
    });

    // Filter in JS to avoid Prisma query complexity issues
    let filtered = sessions;

    if (department) {
      filtered = filtered.filter(s =>
        s.course?.department?.code?.toLowerCase() === department.toLowerCase()
      );
    }

    if (q) {
      const term = q.toLowerCase();
      filtered = filtered.filter(s =>
        s.course?.courseCode?.toLowerCase().includes(term) ||
        s.course?.title?.toLowerCase().includes(term) ||
        s.instructor?.firstName?.toLowerCase().includes(term) ||
        s.instructor?.lastName?.toLowerCase().includes(term)
      );
    }

    const formatted = filtered.map(session => ({
      id: session.id,
      sessionId: session.id,
      sectionNumber: session.sectionNumber,
      modality: session.modality,
      maxStudents: session.maxCapacity,
      enrolledCount: session.enrollments.length,
      remainingSeats: session.maxCapacity - session.enrollments.length,
      meetingDays: session.meetingDays,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      instructor: session.instructor ? {
        id: session.instructor.id,
        firstName: session.instructor.firstName,
        lastName: session.instructor.lastName
      } : null,
      course: session.course ? {
        id: session.course.id,
        courseNumber: session.course.courseCode,
        courseName: session.course.title,
        creditHours: session.course.credits,
        realDesignation: session.course.isReal ? 'y' : 'n',
        prerequisites: session.course.prerequisites || [],
        department: session.course.department ? {
          departmentId: session.course.department.code,
          departmentName: session.course.department.name
        } : null
      } : null
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// =======================
// STUDENTS
// =======================

// Get all students
app.get('/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Find student by student number
app.get('/students/number/:studentNumber', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { studentNumber: req.params.studentNumber }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get one student's enrollments
// Returns session objects (with course + instructor nested) so the
// frontend can display them directly on the My Courses tab
app.get('/students/:id/enrollments', async (req, res) => {
  try {
    const param = req.params.id;

    // Find student by numeric id OR by studentNumber (e.g. "V00100001")
    const student = await prisma.student.findFirst({
      where: isNaN(parseInt(param))
        ? { studentNumber: param }
        : { id: parseInt(param) }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        session: {
          include: {
            course: {
              include: { department: true }
            },
            instructor: true
          }
        }
      }
    });

    // Return session-shaped objects so the frontend can treat them
    // the same way it treats sessions from /sessions
    const formatted = enrollments.map(enrollment => ({
      enrollmentId: enrollment.id,
      id: enrollment.session.id,
      sessionId: enrollment.session.id,
      sectionNumber: enrollment.session.sectionNumber,
      modality: enrollment.session.modality,
      maxStudents: enrollment.session.maxCapacity,
      meetingDays: enrollment.session.meetingDays,
      startTime: enrollment.session.startTime,
      endTime: enrollment.session.endTime,
      location: enrollment.session.location,
      instructor: enrollment.session.instructor
        ? {
            id: enrollment.session.instructor.id,
            firstName: enrollment.session.instructor.firstName,
            lastName: enrollment.session.instructor.lastName
          }
        : null,
      course: enrollment.session.course
        ? {
            id: enrollment.session.course.id,
            courseNumber: enrollment.session.course.courseCode,
            courseName: enrollment.session.course.title,
            creditHours: enrollment.session.course.credits,
            realDesignation: enrollment.session.course.isReal ? 'y' : 'n',
            prerequisites: enrollment.session.course.prerequisites || []
          }
        : null
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// =======================
// INSTRUCTOR ROUTES
// =======================

// Get all sessions taught by one instructor
app.get('/instructors/:id/sessions', async (req, res) => {
  try {
    const instructorId = parseInt(req.params.id);

    const sessions = await prisma.session.findMany({
      where: { instructorId },
      include: {
        course: {
          include: { department: true }
        },
        enrollments: {
          include: { student: true }
        }
      }
    });

    const formatted = sessions.map(session => ({
      id: session.id,
      sessionId: session.id,
      sectionNumber: session.sectionNumber,
      modality: session.modality,
      maxStudents: session.maxCapacity,
      maxCapacity: session.maxCapacity,
      enrolledCount: session.enrollments.length,
      remainingSeats: session.maxCapacity - session.enrollments.length,
      meetingDays: session.meetingDays,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      course: session.course
        ? {
            id: session.course.id,
            courseNumber: session.course.courseCode,
            courseCode: session.course.courseCode,
            courseName: session.course.title,
            title: session.course.title,
            creditHours: session.course.credits,
            credits: session.course.credits,
            realDesignation: session.course.isReal ? 'y' : 'n',
            prerequisites: session.course.prerequisites || []
          }
        : null
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get roster for a specific session
app.get('/sessions/:id/roster', async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        course: true,
        instructor: true,
        enrollments: {
          include: { student: true }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      sessionId: session.id,
      sectionNumber: session.sectionNumber,
      modality: session.modality,
      maxStudents: session.maxCapacity,
      maxCapacity: session.maxCapacity,
      meetingDays: session.meetingDays,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      course: session.course
        ? {
            courseNumber: session.course.courseCode,
            courseCode: session.course.courseCode,
            courseName: session.course.title,
            title: session.course.title
          }
        : null,
      instructor: session.instructor
        ? {
            firstName: session.instructor.firstName,
            lastName: session.instructor.lastName
          }
        : null,
      students: session.enrollments.map(e => ({
        id: e.student.id,
        studentId: e.student.studentNumber,
        studentNumber: e.student.studentNumber,
        firstName: e.student.firstName,
        lastName: e.student.lastName,
        homeCountry: e.student.homeCountry,
        virginiaResident: e.student.virginiaResident
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// =======================
// ENROLLMENTS
// =======================

// Enroll a student in a session
// Body: { studentId: number, sessionId: number }
// Returns the full enrollment with session + course nested
app.post('/enrollments', async (req, res) => {
  try {
    const { studentId, sessionId } = req.body;

    if (!studentId || !sessionId) {
      return res.status(400).json({ error: 'studentId and sessionId are required' });
    }

    // Find student by studentNumber string OR numeric id
    const student = await prisma.student.findFirst({
      where: isNaN(parseInt(studentId))
        ? { studentNumber: String(studentId) }
        : { id: parseInt(studentId) }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const session = await prisma.session.findUnique({
      where: { id: parseInt(sessionId) },
      include: {
        enrollments: true,
        course: true,
        instructor: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check already enrolled in this exact session
    const existingSession = await prisma.enrollment.findFirst({
      where: { studentId: student.id, sessionId: parseInt(sessionId) }
    });
    if (existingSession) {
      return res.status(400).json({ error: 'Already enrolled in this session' });
    }

    // Check duplicate course (different section of same course)
    if (session.courseId) {
      const duplicateCourse = await prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          session: {
            courseId: session.courseId,
            id: { not: parseInt(sessionId) }
          }
        }
      });
      if (duplicateCourse) {
        return res.status(400).json({ error: 'Already registered for another section of this course' });
      }
    }

    // Check capacity
    if (session.enrollments.length >= session.maxCapacity) {
      return res.status(400).json({ error: 'Class is full' });
    }

    // ── Class and credit limit checks ─────────────────────────────────────
    const currentEnrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        session: {
          include: { course: true }
        }
      }
    });

    if (currentEnrollments.length >= 6) {
      return res.status(400).json({
        error: `Class limit reached. You are already enrolled in 6 classes, which is the maximum allowed.`
      });
    }

    const currentCredits = currentEnrollments.reduce((sum, e) => {
      return sum + (e.session?.course?.credits || 0);
    }, 0);

    const newCourseCredits = session.course?.credits || 0;

    if (currentCredits + newCourseCredits > 18) {
      return res.status(400).json({
        error: `Credit limit exceeded. You have ${currentCredits} credits. Adding this course (${newCourseCredits} cr) would exceed the 18-credit maximum.`
      });
    }
    // ──────────────────────────────────────────────────────────────────────

    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        sessionId: parseInt(sessionId),
        status: 'enrolled'
      }
    });

    res.status(201).json({
      enrollment: {
        id: parseInt(sessionId),
        sessionId: parseInt(sessionId),
        sectionNumber: session.sectionNumber,
        modality: session.modality,
        instructor: session.instructor ? {
          firstName: session.instructor.firstName,
          lastName: session.instructor.lastName
        } : null,
        course: session.course ? {
          courseNumber: session.course.courseCode,
          courseName: session.course.title,
          creditHours: session.course.credits,
          realDesignation: session.course.isReal ? 'y' : 'n',
          prerequisites: session.course.prerequisites || []
        } : null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Drop an enrollment
// Accepts body { studentId, sessionId } OR URL param /enrollments/:id
app.delete('/enrollments', async (req, res) => {
  try {
    const { studentId, sessionId } = req.body;

    if (!studentId || !sessionId) {
      return res.status(400).json({ error: 'studentId and sessionId are required' });
    }

    // Find student by studentNumber string OR numeric id
    const student = await prisma.student.findFirst({
      where: isNaN(parseInt(studentId))
        ? { studentNumber: String(studentId) }
        : { id: parseInt(studentId) }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: student.id,
        sessionId: parseInt(sessionId)
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    await prisma.enrollment.delete({ where: { id: enrollment.id } });

    res.json({ message: 'Enrollment dropped successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
