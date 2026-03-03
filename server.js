import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";

const SYSTEM_PROMPT =
  "Bạn là trợ lý học tập. Trả lời ngắn gọn, đúng trọng tâm, dễ hiểu. Nếu thiếu dữ kiện, hãy hỏi lại đúng 1 câu.";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mode: "openai",
    model: OPENAI_MODEL
  });
});

app.post("/api/ask", async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim();
    if (!question) return res.status(400).json({ error: "Missing question" });
    if (question.length > 2000)
      return res.status(400).json({ error: "Question too long (max 2000 chars)" });

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY in environment (.env or hosting env vars)"
      });
    }

    const resp = await openai.responses.create({
      model: OPENAI_MODEL,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ]
    });

    const answer = resp.output_text?.trim() || "(Không có nội dung trả về)";
    res.json({ answer, source: "openai", model: OPENAI_MODEL });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error",
      detail: String(err?.message || err)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
  console.log(`MODE=openai | model=${OPENAI_MODEL}`);
});
