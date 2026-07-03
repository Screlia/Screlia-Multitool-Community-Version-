import { getAI, MODELS } from './gemini';

export interface AIResponse {
  text: string;
  image?: string;
  chunks?: any[];
}

export const generateAIContent = async (
  prompt: string, 
  filters: any, 
  systemInstruction?: string,
  mode: 'search' | 'chat' | 'image' | 'code' = 'chat'
): Promise<AIResponse> => {
  const aiModel = filters.aiModel || 'gemini';
  
  if (aiModel === 'chatgpt' && filters.chatgptApiKey) {
    if (mode === 'image') {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${filters.chatgptApiKey}`
        },
        body: JSON.stringify({
          prompt: prompt,
          model: "dall-e-3",
          n: 1,
          size: "1024x1024"
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to generate image.");
      return { text: "Görsel oluşturuldu.", image: data.data[0].url };
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${filters.chatgptApiKey}`
      },
      body: JSON.stringify({
        model: mode === 'chat' ? 'gpt-4o' : 'gpt-4o-mini',
        messages
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Failed to fetch OpenAI response");
    
    return { text: data.choices[0].message.content || "" };
  } 
  
  else if (aiModel === 'claude' && filters.claudeApiKey) {
    if (mode === 'image') {
       return { text: "Claude görsel oluşturmayı desteklemiyor. Lütfen Gemini veya ChatGPT kullanın." };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': filters.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemInstruction,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Failed to fetch Claude response");
    
    return { text: data.content[0].text };
  }
  
  // Default to Gemini
  else {
    const genAI = getAI(filters.apiKey);
    
    if (mode === 'image') {
      const response = await genAI.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
      });
      let img = undefined;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          img = `data:image/jpeg;base64,${part.inlineData.data}`;
          break;
        }
      }
      return { text: img ? "Görsel oluşturuldu." : (response.text || "Başarısız."), image: img };
    }

    const requestModel = mode === 'search' ? MODELS.search : (mode === 'code' ? 'gemini-3.1-pro-preview' : MODELS.chat);
    const config: any = { systemInstruction };
    
    if (mode === 'search') {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await genAI.models.generateContent({
      model: requestModel,
      contents: prompt,
      config
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return { text: response.text || "", chunks };
  }
};
