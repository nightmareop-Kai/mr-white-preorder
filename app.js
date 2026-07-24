const form = document.querySelector("#reservation-form");
const errorMessage = document.querySelector("#form-error");
const dialog = document.querySelector("#reservation-dialog");
const dialogMessage = document.querySelector("#dialog-message");
const reservationId = document.querySelector("#reservation-id");
const dialogClose = document.querySelector("#dialog-close");
const dialogConfirm = document.querySelector("#dialog-confirm");
const mobileReserveBar = document.querySelector("#mobile-reserve-bar");
const reserveSection = document.querySelector("#reserve");
const storageKey = "mrWhiteFirstDropReservation";

function createReservationId() {
  const stamp = Date.now().toString(36).slice(-5).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MW-001-${stamp}${random}`;
}

function closeDialog() {
  if (dialog.open) dialog.close();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorMessage.textContent = "";
  if (!form.checkValidity()) {
    errorMessage.textContent = "请补全必填信息，并确认首批联系授权。";
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const reservation = {
    id: createReservationId(),
    name: data.get("name"),
    contactMethod: data.get("contactMethod"),
    contact: data.get("contact"),
    style: data.get("style"),
    interests: data.getAll("interest"),
    createdAt: new Date().toISOString(),
    prototypeOnly: true,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(reservation));
  } catch (error) {
    // The prototype can still complete when browser storage is unavailable.
  }

  reservationId.textContent = reservation.id;
  dialogMessage.textContent = `${reservation.name}，你选择的是 ${reservation.style}。这份预订信息已保存在当前浏览器中；支付仅为页面演示，未产生任何真实扣款。`;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");

  form.reset();
  form.querySelector('input[value="BLACK HOODIE + HEADPHONES"]').checked = true;
  form.querySelector('input[value="BASE BODY"]').checked = true;
});

dialogClose.addEventListener("click", closeDialog);
dialogConfirm.addEventListener("click", closeDialog);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});

if (mobileReserveBar && reserveSection && "IntersectionObserver" in window) {
  const reserveObserver = new IntersectionObserver(
    ([entry]) => mobileReserveBar.classList.toggle("is-hidden", entry.isIntersecting),
    { threshold: 0.12 },
  );
  reserveObserver.observe(reserveSection);
}
