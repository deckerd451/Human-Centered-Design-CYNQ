import React from 'react';
interface MarkdownRendererProps {
  content: string;
}
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderLines = () => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    const flushList = (key: string) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key} className="list-disc pl-6 space-y-2 my-4">
            {listItems.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
        listItems = [];
      }
    };
    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('## ')) {
        flushList(`ul-${index}`);
        elements.push(<h2 key={index} className="text-2xl font-semibold mt-6 mb-3 pb-2 border-b">{line.substring(3)}</h2>);
        return;
      }
      if (line.startsWith('# ')) {
        flushList(`ul-${index}`);
        elements.push(<h1 key={index} className="text-3xl font-bold mt-8 mb-4 pb-2 border-b">{line.substring(2)}</h1>);
        return;
      }
      // Process inline styles like bold
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // List items
      if (processedLine.trim().startsWith('* ')) {
        listItems.push(processedLine.trim().substring(2));
        return;
      }
      // Paragraphs
      flushList(`ul-${index}`);
      if (processedLine.trim() !== '') {
        elements.push(<p key={index} className="my-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLine }} />);
      }
    });
    flushList('ul-end'); // Flush any remaining list items
    return elements;
  };
  return (
    <div className="prose dark:prose-invert max-w-none text-foreground/90">
      {renderLines()}
    </div>
  );
};
export default MarkdownRenderer;