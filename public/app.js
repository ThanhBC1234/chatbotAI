const chat = document.getElementById("chat");
const input = document.getElementById("q");
const sendBtn = document.getElementById("send");
const modePill = document.getElementById("modePill");

function addMsg(text, who, meta = "") {
  const wrap = document.createElement("div");
  wrap.className = `msg ${who}`;
  wrap.textContent = text;

  if (meta) {
    const m = document.createElement("div");
    m.className = "meta";
    m.textContent = meta;
    wrap.appendChild(m);
  }

  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

async function loadHealth() {
  try {
    const r = await fetch("/api/health");
    const j = await r.json();
    modePill.textContent = `MODE: ${j.mode} | model: ${j.model}`;
  } catch {
    modePill.textContent = "MODE: (không rõ)";
  }
}

async function ask(question) {
  sendBtn.disabled = true;
  addMsg(question, "user");
  input.value = "";

  try {
    const r = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const j = await r.json();
    if (!r.ok) {
      addMsg(j.error || "Lỗi", "bot");
      return;
    }

    const meta = `Nguồn: openai | model: ${j.model || ""}`;
    addMsg(j.answer || "(trống)", "bot", meta);
  } catch (e) {
    addMsg("Không gọi được server. Bạn đã deploy/chạy server chưa?", "bot");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

sendBtn.addEventListener("click", () => {
  const q = input.value.trim();
  if (q) ask(q);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const q = input.value.trim();
    if (q) ask(q);
  }
});

addMsg("Chào bạn! Hãy nhập câu hỏi môn học (TH1: trả lời bằng AI).", "bot");
loadHealth();
