// Previous imports remain the same...

export default function MemeGeneratorPage() {
  // Previous state declarations remain the same...

  const generateMeme = async () => {
    if (!description.trim()) {
      toast({ variant: "destructive", title: "Missing Input", description: "Please provide a description of the meme you want to generate." });
      return;
    }

    setIsLoading(true);
    setGeneratedMeme(null);
    setError(null);
    toast({ title: "Generation Started", description: "AI is analyzing your request and generating the meme..." });

    try {
      if (typeof window.puter === 'undefined' || !window.puter.auth || !window.puter.ai) {
        throw new Error("Puter SDK not available. Please refresh.");
      }
      const puter = window.puter;

      let isSignedIn = await puter.auth.isSignedIn();
      if (!isSignedIn) {
        await puter.auth.signIn();
        isSignedIn = await puter.auth.isSignedIn();
        if (!isSignedIn) throw new Error("Authentication failed or was cancelled.");
      }

      // First, analyze training images to understand meme style
      const styleAnalysisPromises = MEME_TRAINING_IMAGES.slice(0, 5).map(imageUrl => 
        puter.ai.chat("Analyze this meme image. Focus on: 1) Visual style 2) Text placement 3) Humor elements 4) Overall composition. Provide insights in a concise format.", imageUrl)
      );

      const styleAnalyses = await Promise.all(styleAnalysisPromises);
      
      // Process user's request with GPT-4
      const requestPrompt = `
        Based on the user's meme request: "${description}"
        Style preference: "${style || 'Not specified'}"
        Text placement preference: "${textPlacement || 'Not specified'}"
        Additional context: "${additionalContext || 'None provided'}"

        Create a DALL-E 3 prompt that will generate a meme image matching these requirements.
        The prompt should be clear, specific, and focus on visual elements.
        Avoid any text in the image itself - we'll add that separately.
        
        Return a JSON object with:
        {
          "dalle_prompt": "Your detailed prompt for DALL-E 3 (focus on visual elements only)",
          "style_notes": "Brief description of the chosen style",
          "text_placement": "Specific instructions for text placement"
        }
      `;

      const requestResponse = await puter.ai.chat(requestPrompt, { model: 'gpt-4o' });
      if (!requestResponse?.message?.content) {
        throw new Error("Failed to process meme request.");
      }

      const parsedRequest = JSON.parse(cleanJsonString(requestResponse.message.content));

      // Generate the meme image using DALL-E 3
      try {
        const imageResponse = await puter.ai.txt2img(parsedRequest.dalle_prompt);
        if (!imageResponse) {
          throw new Error("Image generation returned empty response");
        }

        const generatedReport: MemeGenerationReport = {
          generated_image: imageResponse.src,
          prompt_used: parsedRequest.dalle_prompt,
          style_applied: parsedRequest.style_notes,
          confidence: 'High',
          disclaimer: "AI-generated meme. Results may vary. For entertainment purposes only."
        };

        setGeneratedMeme(generatedReport);
        toast({ 
          title: "Meme Generated!", 
          variant: "default", 
          className: "bg-green-500 text-white dark:bg-green-600" 
        });
      } catch (imageError: any) {
        console.error("Image generation error:", imageError);
        throw new Error("Failed to generate image. This could be due to content restrictions or technical limitations. Please try a different description or try again later.");
      }

    } catch (err: any) {
      console.error("Generation error:", err);
      let errorMessage = "An error occurred during meme generation.";
      if (err instanceof Error) errorMessage = err.message;
      else if (typeof err === 'string') errorMessage = err;
      else if (err.error && err.error.message) errorMessage = err.error.message;
      setError(errorMessage);
      toast({ 
        variant: "destructive", 
        title: "Generation Failed", 
        description: "Failed to generate meme. Please try a different description or try again later." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component remains the same...
}