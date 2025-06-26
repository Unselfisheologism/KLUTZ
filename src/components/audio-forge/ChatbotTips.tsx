import React from 'react';

const ChatbotTips: React.FC = () => {
  return (
    <section className="mt-8 p-4 border rounded-md bg-gray-800 border-gray-700">
      <h3 className="text-lg font-semibold mb-2">Tips for using the AI Chatbot</h3>
      <p className="text-sm text-gray-400">
        To get the best results from the AI chatbot, try to be specific and use the name of the tool you want to use in your command.
      </p>
      <p className="text-sm text-gray-400 mt-2">
        For example, instead of saying:
        <span className="block italic ml-4 text-gray-500">"what is the rpm of this song"</span>
        try saying:
        <span className="block italic ml-4 text-gray-300">"run the rpm detector on this audio file"</span>
      </p>
      <p className="text-sm text-gray-400 mt-2">
        Using the tool's name helps the chatbot understand your intent more accurately.
      </p>
    </section>
  );
};

export default ChatbotTips;