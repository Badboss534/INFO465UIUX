const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── 0. Clear existing data (order matters for FK constraints) ──────────────
  await prisma.enrollment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.course.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.student.deleteMany();
  await prisma.department.deleteMany();
  console.log("🗑️  Cleared existing data");

  // ── 1. Departments ─────────────────────────────────────────────────────────
  const departments = await Promise.all([
    prisma.department.create({
      data: { code: "INFO", name: "Information Systems", school: "School of Business" }
    }),
    prisma.department.create({
      data: { code: "MKTG", name: "Marketing", school: "School of Business" }
    }),
    prisma.department.create({
      data: { code: "ACCT", name: "Accounting", school: "School of Business" }
    }),
    prisma.department.create({
      data: { code: "FINA", name: "Finance", school: "School of Business" }
    }),
  ]);

  const [infoDept, mktgDept, acctDept, finaDept] = departments;
  console.log("✅ Departments created");

  // ── 2. Instructors ─────────────────────────────────────────────────────────
  const instructorData = [
    // INFO
    { firstName: "James",   lastName: "Carter",   email: "jcarter@vcu.edu",   departmentId: infoDept.id },
    { firstName: "Linda",   lastName: "Nguyen",   email: "lnguyen@vcu.edu",   departmentId: infoDept.id },
    { firstName: "Robert",  lastName: "Patel",    email: "rpatel@vcu.edu",    departmentId: infoDept.id },
    // MKTG
    { firstName: "Sarah",   lastName: "Williams", email: "swilliams@vcu.edu", departmentId: mktgDept.id },
    { firstName: "Marcus",  lastName: "Thompson", email: "mthompson@vcu.edu", departmentId: mktgDept.id },
    // ACCT
    { firstName: "Patricia",lastName: "Lee",      email: "plee@vcu.edu",      departmentId: acctDept.id },
    { firstName: "David",   lastName: "Kim",      email: "dkim@vcu.edu",      departmentId: acctDept.id },
    // FINA
    { firstName: "Angela",  lastName: "Moore",    email: "amoore@vcu.edu",    departmentId: finaDept.id },
    { firstName: "Charles", lastName: "Davis",    email: "cdavis@vcu.edu",    departmentId: finaDept.id },
  ];

  const instructors = await Promise.all(
    instructorData.map(data => prisma.instructor.create({ data }))
  );

  const infoInstructors = instructors.filter(i => i.departmentId === infoDept.id);
  const mktgInstructors = instructors.filter(i => i.departmentId === mktgDept.id);
  const acctInstructors = instructors.filter(i => i.departmentId === acctDept.id);
  const finaInstructors = instructors.filter(i => i.departmentId === finaDept.id);
  console.log("✅ Instructors created");

  // ── 3. Courses & Sessions ──────────────────────────────────────────────────
  const modalities = ["Online", "In-person", "Hybrid", "Asynchronous"];
  const sections   = ["001", "002", "003"];

  const courseDefinitions = [
    // ── Information Systems ──
    {
      dept: infoDept,
      courseCode: "INFO 160",
      title: "Introduction to Information Systems",
      description: "Foundations of information systems, data management, and computing in organizations.",
      credits: 3,
      isReal: false,
      prerequisites: [],
      instructors: infoInstructors,
      sessions: 3,
      capacities: [25, 30, 20]
    },
    {
      dept: infoDept,
      courseCode: "INFO 300",
      title: "Database Management Systems",
      description: "Relational database design, SQL, normalization, and database administration.",
      credits: 3,
      isReal: false,
      prerequisites: ["INFO 160"],
      instructors: infoInstructors,
      sessions: 2,
      capacities: [25, 20]
    },
    {
      dept: infoDept,
      courseCode: "INFO 360",
      title: "Systems Analysis and Design",
      description: "Methods for analyzing and designing information systems using modern frameworks.",
      credits: 3,
      isReal: true,
      prerequisites: ["INFO 160"],
      instructors: infoInstructors,
      sessions: 2,
      capacities: [30, 25]
    },
    {
      dept: infoDept,
      courseCode: "INFO 465",
      title: "Projects in Information Systems",
      description: "Capstone project course integrating all aspects of information systems development.",
      credits: 3,
      isReal: true,
      prerequisites: ["INFO 360"],
      instructors: infoInstructors,
      sessions: 2,
      capacities: [20, 20]
    },
    {
      dept: infoDept,
      courseCode: "INFO 480",
      title: "Cybersecurity Fundamentals",
      description: "Introduction to cybersecurity principles, threats, and defensive strategies.",
      credits: 3,
      isReal: false,
      prerequisites: ["INFO 300"],
      instructors: infoInstructors,
      sessions: 1,
      capacities: [25]
    },

    // ── Marketing ──
    {
      dept: mktgDept,
      courseCode: "MKTG 301",
      title: "Principles of Marketing",
      description: "Core marketing concepts including the marketing mix, consumer behavior, and market research.",
      credits: 3,
      isReal: false,
      prerequisites: [],
      instructors: mktgInstructors,
      sessions: 3,
      capacities: [35, 35, 30]
    },
    {
      dept: mktgDept,
      courseCode: "MKTG 350",
      title: "Consumer Behavior",
      description: "Psychological and social factors influencing consumer purchasing decisions.",
      credits: 3,
      isReal: false,
      prerequisites: ["MKTG 301"],
      instructors: mktgInstructors,
      sessions: 2,
      capacities: [30, 25]
    },
    {
      dept: mktgDept,
      courseCode: "MKTG 410",
      title: "Digital Marketing Strategy",
      description: "SEO, social media, email campaigns, and analytics-driven marketing approaches.",
      credits: 3,
      isReal: true,
      prerequisites: ["MKTG 301"],
      instructors: mktgInstructors,
      sessions: 2,
      capacities: [25, 25]
    },
    {
      dept: mktgDept,
      courseCode: "MKTG 460",
      title: "Marketing Research",
      description: "Research design, data collection, and analysis methods for marketing decisions.",
      credits: 3,
      isReal: false,
      prerequisites: ["MKTG 350"],
      instructors: mktgInstructors,
      sessions: 1,
      capacities: [20]
    },

    // ── Accounting ──
    {
      dept: acctDept,
      courseCode: "ACCT 203",
      title: "Financial Accounting",
      description: "Introduction to financial statements, accounting cycles, and GAAP principles.",
      credits: 3,
      isReal: false,
      prerequisites: [],
      instructors: acctInstructors,
      sessions: 3,
      capacities: [35, 30, 30]
    },
    {
      dept: acctDept,
      courseCode: "ACCT 204",
      title: "Managerial Accounting",
      description: "Cost accounting, budgeting, and financial information for internal decision-making.",
      credits: 3,
      isReal: false,
      prerequisites: ["ACCT 203"],
      instructors: acctInstructors,
      sessions: 2,
      capacities: [30, 25]
    },
    {
      dept: acctDept,
      courseCode: "ACCT 305",
      title: "Intermediate Accounting I",
      description: "In-depth coverage of financial reporting standards and complex accounting topics.",
      credits: 3,
      isReal: false,
      prerequisites: ["ACCT 204"],
      instructors: acctInstructors,
      sessions: 2,
      capacities: [25, 20]
    },
    {
      dept: acctDept,
      courseCode: "ACCT 420",
      title: "Auditing and Assurance",
      description: "Auditing standards, risk assessment, internal controls, and professional ethics.",
      credits: 3,
      isReal: false,
      prerequisites: ["ACCT 305"],
      instructors: acctInstructors,
      sessions: 1,
      capacities: [20]
    },

    // ── Finance ──
    {
      dept: finaDept,
      courseCode: "FINA 301",
      title: "Principles of Finance",
      description: "Time value of money, capital budgeting, risk and return, and financial markets.",
      credits: 3,
      isReal: false,
      prerequisites: ["ACCT 203"],
      instructors: finaInstructors,
      sessions: 3,
      capacities: [35, 30, 25]
    },
    {
      dept: finaDept,
      courseCode: "FINA 350",
      title: "Corporate Finance",
      description: "Capital structure, dividend policy, mergers and acquisitions, and firm valuation.",
      credits: 3,
      isReal: false,
      prerequisites: ["FINA 301"],
      instructors: finaInstructors,
      sessions: 2,
      capacities: [30, 25]
    },
    {
      dept: finaDept,
      courseCode: "FINA 410",
      title: "Investments and Portfolio Management",
      description: "Security analysis, portfolio theory, asset pricing models, and market efficiency.",
      credits: 3,
      isReal: true,
      prerequisites: ["FINA 350"],
      instructors: finaInstructors,
      sessions: 2,
      capacities: [25, 20]
    },
    {
      dept: finaDept,
      courseCode: "FINA 450",
      title: "Financial Risk Management",
      description: "Derivatives, hedging strategies, and risk measurement techniques.",
      credits: 3,
      isReal: false,
      prerequisites: ["FINA 410"],
      instructors: finaInstructors,
      sessions: 1,
      capacities: [20]
    },
  ];

  const allSessions = [];

  for (const def of courseDefinitions) {
    const course = await prisma.course.create({
      data: {
        courseCode: def.courseCode,
        title: def.title,
        description: def.description,
        credits: def.credits,
        isReal: def.isReal,
        prerequisites: def.prerequisites,
        departmentId: def.dept.id
      }
    });

    for (let s = 0; s < def.sessions; s++) {
      const instructor = def.instructors[s % def.instructors.length];
      const session = await prisma.session.create({
        data: {
          courseId: course.id,
          instructorId: instructor.id,
          semester: "Summer",
          year: 2026,
          sectionNumber: sections[s],
          modality: modalities[s % modalities.length],
          meetingDays: s % 2 === 0 ? "MWF" : "TR",
          startTime: s === 0 ? "09:00" : s === 1 ? "13:00" : "18:00",
          endTime:   s === 0 ? "10:15" : s === 1 ? "14:15" : "19:15",
          location: `${def.dept.code} Building Room ${100 + (s * 10)}`,
          maxCapacity: def.capacities[s]
        }
      });
      allSessions.push(session);
    }
  }

  console.log(`✅ ${courseDefinitions.length} courses and ${allSessions.length} sessions created`);

  // ── 4. Students ────────────────────────────────────────────────────────────
  const countries = [
    "United States", "United States", "United States", "United States",
    "India", "China", "South Korea", "Nigeria", "Brazil",
    "Canada", "Mexico", "Ireland", "United Kingdom", "Germany", "Japan"
  ];

  const studentData = [
    { firstName: "Jordan",   lastName: "Mitchell",  studentNumber: "V00100001", homeCountry: "United States", virginiaResident: true },
    { firstName: "Priya",    lastName: "Sharma",    studentNumber: "V00100002", homeCountry: "India",         virginiaResident: false },
    { firstName: "Tyler",    lastName: "Johnson",   studentNumber: "V00100003", homeCountry: "United States", virginiaResident: true },
    { firstName: "Mei",      lastName: "Chen",      studentNumber: "V00100004", homeCountry: "China",         virginiaResident: false },
    { firstName: "Aaliyah",  lastName: "Davis",     studentNumber: "V00100005", homeCountry: "United States", virginiaResident: true },
    { firstName: "Carlos",   lastName: "Rivera",    studentNumber: "V00100006", homeCountry: "Mexico",        virginiaResident: false },
    { firstName: "Emma",     lastName: "Wilson",    studentNumber: "V00100007", homeCountry: "United States", virginiaResident: true },
    { firstName: "Jin",      lastName: "Park",      studentNumber: "V00100008", homeCountry: "South Korea",   virginiaResident: false },
    { firstName: "Destiny",  lastName: "Brown",     studentNumber: "V00100009", homeCountry: "United States", virginiaResident: true },
    { firstName: "Oliver",   lastName: "Murphy",    studentNumber: "V00100010", homeCountry: "Ireland",       virginiaResident: false },
    { firstName: "Fatima",   lastName: "Hassan",    studentNumber: "V00100011", homeCountry: "Nigeria",       virginiaResident: false },
    { firstName: "Nathan",   lastName: "Taylor",    studentNumber: "V00100012", homeCountry: "United States", virginiaResident: true },
    { firstName: "Yuki",     lastName: "Tanaka",    studentNumber: "V00100013", homeCountry: "Japan",         virginiaResident: false },
    { firstName: "Brianna",  lastName: "Anderson",  studentNumber: "V00100014", homeCountry: "United States", virginiaResident: true },
    { firstName: "Lucas",    lastName: "Schneider", studentNumber: "V00100015", homeCountry: "Germany",       virginiaResident: false },
    { firstName: "Jasmine",  lastName: "Thomas",    studentNumber: "V00100016", homeCountry: "United States", virginiaResident: true },
    { firstName: "Arjun",    lastName: "Gupta",     studentNumber: "V00100017", homeCountry: "India",         virginiaResident: false },
    { firstName: "Madison",  lastName: "Martin",    studentNumber: "V00100018", homeCountry: "United States", virginiaResident: true },
    { firstName: "Rafael",   lastName: "Santos",    studentNumber: "V00100019", homeCountry: "Brazil",        virginiaResident: false },
    { firstName: "Chloe",    lastName: "White",     studentNumber: "V00100020", homeCountry: "United States", virginiaResident: true },
  ];

  const students = [];
  for (const s of studentData) {
    const student = await prisma.student.create({
      data: {
        firstName: s.firstName,
        lastName: s.lastName,
        email: `${s.studentNumber.toLowerCase()}@vcu.edu`,
        studentNumber: s.studentNumber,
        homeCountry: s.homeCountry,
        virginiaResident: s.virginiaResident
      }
    });
    students.push(student);
  }

  console.log(`✅ ${students.length} students created`);

  // ── 5. Enrollments ─────────────────────────────────────────────────────────
  // Each student gets enrolled in sessions, capped at 6 classes and 18 credits
  const enrolledCoursesPerStudent = new Map();   // studentId -> Set of courseIds
  const enrollmentCountPerStudent = new Map();   // studentId -> number of enrollments
  const creditCountPerStudent = new Map();       // studentId -> total credits

  for (const student of students) {
    enrolledCoursesPerStudent.set(student.id, new Set());
    enrollmentCountPerStudent.set(student.id, 0);
    creditCountPerStudent.set(student.id, 0);
  }

  // Shuffle sessions so enrollment is spread naturally
  const shuffledSessions = faker.helpers.shuffle([...allSessions]);
  let totalEnrollments = 0;

  for (const session of shuffledSessions) {
    // Get the courseId for this session
    const sessionFull = await prisma.session.findUnique({
      where: { id: session.id },
      include: { enrollments: true, course: true }
    });

    const spotsLeft = sessionFull.maxCapacity - sessionFull.enrollments.length;
    if (spotsLeft <= 0) continue;

    const courseCredits = sessionFull.course?.credits || 0;

    const numToEnroll = Math.min(
      faker.number.int({ min: 3, max: Math.min(12, spotsLeft) }),
      spotsLeft
    );

    // Pick students who haven't taken this course yet and are within limits
    const eligible = students.filter(s => {
      const taken = enrolledCoursesPerStudent.get(s.id);
      const count = enrollmentCountPerStudent.get(s.id);
      const credits = creditCountPerStudent.get(s.id);
      return (
        !taken.has(sessionFull.course.id) &&
        count < 6 &&
        credits + courseCredits <= 18
      );
    });

    const picked = faker.helpers.shuffle(eligible).slice(0, numToEnroll);

    for (const student of picked) {
      try {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            sessionId: session.id,
            status: "enrolled"
          }
        });
        enrolledCoursesPerStudent.get(student.id).add(sessionFull.course.id);
        enrollmentCountPerStudent.set(student.id, enrollmentCountPerStudent.get(student.id) + 1);
        creditCountPerStudent.set(student.id, creditCountPerStudent.get(student.id) + courseCredits);
        totalEnrollments++;
      } catch (err) {
        // skip on unique constraint
      }
    }
  }

  console.log(`✅ ${totalEnrollments} enrollments created`);
  console.log("🎉 Seeding complete! Summer 2026 is ready.");
  console.log("\n📋 Test student IDs:");
  students.slice(0, 5).forEach(s => {
    console.log(`   ${s.studentNumber} — ${s.firstName} ${s.lastName}`);
  });
  console.log("\n📋 Test instructor emails:");
  instructors.slice(0, 3).forEach(i => {
    console.log(`   ${i.email} — ${i.firstName} ${i.lastName}`);
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
