// src/components/ui/Card.jsx
export function Card({ children }) {
    return <div className="bg-white shadow rounded-lg p-4">{children}</div>;
  }
  
  export function CardHeader({ children }) {
    return <div className="border-b pb-2 mb-4">{children}</div>;
  }
  
  export function CardTitle({ children }) {
    return <h2 className="text-xl font-semibold">{children}</h2>;
  }
  
  export function CardContent({ children }) {
    return <div className="text-gray-600">{children}</div>;
  }
  