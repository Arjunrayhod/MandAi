import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context, clientApiKey } = body;

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        message: 'No API key provided. Falling back to built-in local autonomous engine.' 
      }, { status: 200 });
    }

    const systemPrompt = `You are MandAi Agent, the intelligent AI business assistant and manager for Mandi Vyaparis, Commission Agents (Aadhatiyas), and Agricultural traders in India.
You understand Hindi, Hinglish, and English fluently.
The user is a grain/seed trader (Company: "${context?.company?.name || 'Rathore Trading Company'}", Owner: "${context?.company?.ownerName || 'Arjun Rathore'}").

Current System Master Data:
- Available Parties:
${(context?.parties || []).map((p: any) => `  * ${p.businessName || p.name} (Phone: ${p.phone}, Balance: Rs ${p.currentBalance}, Type: ${p.type})`).join('\n')}

- Available Products:
${(context?.products || []).map((p: any) => `  * ${p.name} (${p.hindiName || ''}, Stock: ${p.currentStock} Kg, Price: Rs ${p.sellingPrice}/Kg, Bag: ${p.bagWeightKg || 50}kg)`).join('\n')}

- Financial Snapshot:
  * Cash in Hand: Rs ${context?.cashInHand || 0}
  * Bank Accounts: ${(context?.bankAccounts || []).map((b: any) => `${b.bankName}: Rs ${b.currentBalance}`).join(', ')}
  * Total Invoices: ${(context?.invoices || []).length}
  * Total Sauda Slips: ${(context?.saudaSlips || []).length}

YOUR INSTRUCTIONS:
1. Speak in friendly, respectful, authentic Indian Mandi language (Hindi/Hinglish with emojis like 🙏, 🌾, 🧾, 💰).
2. Understand any query: creating bills, creating sauda parcha, recording payments, recording shop expenses, stock adjustments, adding parties, mandi rules, tax guidance, or general questions.
3. In your response, give a clear, informative explanation.
4. If an actionable operation is detected, classify the intent into one of: "create_bill", "create_sauda", "record_payment", "add_expense", "update_stock", "add_party", "navigate", or "none".

Output strictly valid JSON with this exact schema:
{
  "text": "Your helpful response in Hindi/Hinglish with markdown formatting",
  "actionIntent": "create_bill" | "create_sauda" | "record_payment" | "add_expense" | "update_stock" | "add_party" | "navigate" | "none"
}`;

    // Call Google Gemini Flash
    const candidateModels = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
    let geminiRes: Response | null = null;
    let lastErrText = '';

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(3500),
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUser Query: "${query}"` }]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            }
          })
        });

        if (resp.ok) {
          geminiRes = resp;
          break;
        } else {
          lastErrText = await resp.text();
          console.warn(`Model ${model} returned status ${resp.status}:`, lastErrText);
        }
      } catch (err: any) {
        lastErrText = err?.message || String(err);
      }
    }

    if (!geminiRes || !geminiRes.ok) {
      console.warn('All Gemini models failed:', lastErrText);
      return NextResponse.json({ 
        success: false, 
        message: `Gemini API call failed`,
        fallbackToLocal: true 
      });
    }

    const data = await geminiRes.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawJson) {
      return NextResponse.json({ success: false, fallbackToLocal: true });
    }

    const parsed = JSON.parse(rawJson);

    return NextResponse.json({
      success: true,
      text: parsed.text,
      actionIntent: parsed.actionIntent || 'none',
      source: 'gemini_cloud',
    });

  } catch (error: any) {
    console.error('API /api/ai error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server error', 
      fallbackToLocal: true 
    });
  }
}
