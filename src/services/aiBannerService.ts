import { GoogleGenAI } from '@google/genai';

/**
 * Generates a unique, professional, and modern 'Welcome to DiaVet' AI banner
 * using Gemini/Imagen image models, with a rich fallback canvas generator.
 */
export async function generateWelcomeBanner(
  userName: string, 
  role: 'owner' | 'vet', 
  petOrClinicName?: string
): Promise<string> {
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const roleTitle = role === 'vet' ? `Docteur Vétérinaire (${petOrClinicName || 'Clinique'})` : `Propriétaire d'Animal (${petOrClinicName || 'Compagnon'})`;
      const prompt = `A breathtaking, professional, high-tech 'Welcome to DiaVet Algeria' banner for ${userName}, ${roleTitle}. Dark luxury cyber aesthetic, glowing neon cyan and emerald lighting, golden Algerian crescent and star accent, futuristic veterinary medical emblem, 16:9 aspect ratio, ultra high resolution.`;

      // 2.5s Timeout wrapper to prevent blocking UI loading
      const apiCallPromise = ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI Banner request timeout')), 2500)
      );

      const response = await Promise.race([apiCallPromise, timeoutPromise]);

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            return `data:${mime};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (err) {
      console.warn("Imagen model API call deferred or fallback activated:", err);
    }
  }

  // High quality custom Canvas Banner Generator fallback
  return generateCanvasWelcomeBanner(userName, role, petOrClinicName);
}

/**
 * Custom Canvas Welcome Banner Generator
 * Renders a high-resolution 1200x675 (16:9) personalized banner image.
 */
export function generateCanvasWelcomeBanner(
  userName: string,
  role: 'owner' | 'vet',
  petOrClinicName?: string
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 675; // 16:9 aspect ratio
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(getStaticFallbackBanner());
        return;
      }

      // Background Gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 1200, 675);
      bgGradient.addColorStop(0, '#020617'); // Dark slate/navy
      bgGradient.addColorStop(0.5, '#0f172a');
      bgGradient.addColorStop(1, '#020617');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1200, 675);

      // Neon Radial Aura Glows
      const cyanGlow = ctx.createRadialGradient(200, 150, 10, 200, 150, 450);
      cyanGlow.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      cyanGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = cyanGlow;
      ctx.fillRect(0, 0, 1200, 675);

      const emeraldGlow = ctx.createRadialGradient(1000, 500, 10, 1000, 500, 450);
      emeraldGlow.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
      emeraldGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = emeraldGlow;
      ctx.fillRect(0, 0, 1200, 675);

      // Tech Grid Pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1200; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 675);
        ctx.stroke();
      }
      for (let y = 0; y < 675; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }

      // Golden Algerian Tri-color Top Accent Line
      const flagGradient = ctx.createLinearGradient(0, 0, 1200, 0);
      flagGradient.addColorStop(0, '#10b981'); // Emerald
      flagGradient.addColorStop(0.5, '#ffffff'); // White
      flagGradient.addColorStop(1, '#f43f5e'); // Rose/Red
      ctx.fillStyle = flagGradient;
      ctx.fillRect(0, 0, 1200, 8);

      // Outer Frame
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 38, 1140, 599);

      // Header Tag / Badge
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(80, 80, 420, 44, 22);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('🇩🇿  DIAVET ALGÉRIE • PASSPORT OFFICIEL', 105, 108);

      // Main Title Text
      ctx.font = '900 52px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('BIENVENUE SUR DIAVET !', 80, 200);

      // User Name Highlight
      const displayName = userName.toUpperCase();
      ctx.font = '900 64px sans-serif';
      const nameGradient = ctx.createLinearGradient(80, 0, 800, 0);
      nameGradient.addColorStop(0, '#38bdf8');
      nameGradient.addColorStop(0.5, '#34d399');
      nameGradient.addColorStop(1, '#fbbf24');
      ctx.fillStyle = nameGradient;
      ctx.fillText(displayName, 80, 285);

      // Role & Subtitle Badge
      const roleText = role === 'vet'
        ? `DOCTEUR VÉTÉRINAIRE AGRÉÉ (ONMV) • ${petOrClinicName || 'Pratique Clinique'}`
        : `MEMBRE PROPRIÉTAIRE VIP • ${petOrClinicName || 'Compagnon Fidéle'}`;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(80, 325, 780, 54, 16);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(roleText, 105, 360);

      // Footer Message / Serial
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Votre compte est certifié et protégé sur l\'ensemble des 58 Wilayas d\'Algérie.', 80, 430);

      // Decorative Mascot Seal / QR Placeholder Box
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(900, 180, 220, 260, 24);
      ctx.fill();
      ctx.stroke();

      ctx.font = '64px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(role === 'vet' ? '🩺' : '🐾', 1010, 280);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('SEAL DIAVET DZ', 1010, 330);

      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`ID-${Date.now().toString().slice(-6)}`, 1010, 360);

      // Bottom Bar Serial
      ctx.textAlign = 'left';
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`SERIAL : DV-AI-IMAGEN-2026-DZ-${Math.floor(100000 + Math.random() * 900000)}`, 80, 580);

      const dataUrl = canvas.toDataURL('image/png', 0.92);
      resolve(dataUrl);
    } catch {
      resolve(getStaticFallbackBanner());
    }
  });
}

function getStaticFallbackBanner(): string {
  return "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200";
}
