import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse bg-white rounded-lg shadow-md overflow-hidden">
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead style={{ backgroundColor: "var(--craigies-olive)" }}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className = "" }: TableRowProps) {
  return (
    <tr
      className={`border-b border-gray-200 last:border-0 ${
        onClick ? "cursor-pointer hover:bg-gray-50" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableHeadCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeadCell({ children, className = "" }: TableHeadCellProps) {
  return (
    <th
      className={`px-6 py-4 text-left text-sm font-semibold text-white ${className}`}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return (
    <td
      className={`px-6 py-4 text-sm ${className}`}
      style={{ color: "var(--craigies-dark-olive)" }}
    >
      {children}
    </td>
  );
}
