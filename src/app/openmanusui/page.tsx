// This is the new UI page for OpenManus.
// It will use the Pollinations.AI API for AI features.

import React, { useState } from 'react';

const OpenManusUI = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setOutputText('');

    try {
      // Call your backend API route that interacts with OpenManus
      const response = await fetch('/api/openmanus', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from OpenManus API');
      }

      const data = await response.json();
      setOutputText(data.response);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OpenManus UI</h1>
      <div className="mb-4">
        <textarea
          className="w-full p-2 border border-gray-300 rounded"
          rows={6}
          placeholder="Enter your prompt here..."
          value={inputText}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>
      <button
        className={`px-4 py-2 rounded ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Generate'}
      </button>
      {error && (
        <div className="mt-4 text-red-500">
          Error: {error}
        </div>
      )}
      {outputText && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Generated Text:</h2>
          <p>{outputText}</p>
        </div>
      )}
    </div>
  );
};

export default OpenManusUI;