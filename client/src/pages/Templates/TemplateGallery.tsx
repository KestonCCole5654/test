import React from "react";

const templates = [
  { id: 1, name: "Classic", description: "A clean, classic invoice template." },
  { id: 2, name: "Modern", description: "A modern, bold invoice template." },
  { id: 3, name: "Minimal", description: "A minimal, simple invoice template." },
  { id: 4, name: "Elegant", description: "An elegant, professional invoice template." },
];

export default function TemplateGallery() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Template Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border rounded-xl shadow p-6 flex flex-col items-center">
            <div className="w-full h-32 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400 text-lg">
              [Template Preview]
            </div>
            <div className="font-semibold text-lg mb-1">{template.name}</div>
            <div className="text-gray-500 text-sm mb-4 text-center">{template.description}</div>
            <button className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded font-medium transition-all">Set as Default</button>
          </div>
        ))}
      </div>
    </div>
  );
} 