// Loads footer.html and injects it into #footer-placeholder on every page.
document.addEventListener('DOMContentLoaded', function () {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  fetch('footer.html')
    .then(function (res) { return res.text(); })
    .then(function (html) { placeholder.innerHTML = html; })
    .catch(function () {
      // Fallback if fetch fails (e.g. file:// protocol)
      placeholder.innerHTML =
        '<footer>' +
          '<p>\u00A9 2026 Virginia Commonwealth University \u00A0\u00B7\u00A0 Office of the University Registrar</p>' +
          '<div class="footer-links">' +
            '<a href="#">VCU.edu</a>' +
            '<a href="#">Registrar</a>' +
            '<a href="#">IT Help Desk</a>' +
          '</div>' +
        '</footer>';
    });
});
