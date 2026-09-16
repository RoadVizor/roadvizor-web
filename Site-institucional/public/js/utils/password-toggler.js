function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const inputIcon = document.getElementById(`${inputId}-icon`);

  if (input.type === "password") {
    input.type = "text";
    inputIcon.classList.replace("ph-eye", "ph-eye-slash");
  } else {
    input.type = "password";
    inputIcon.classList.replace("ph-eye-slash", "ph-eye");
  }
}
