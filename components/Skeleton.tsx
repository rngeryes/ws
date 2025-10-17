// Skeleton компонент
const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`bg-gray-700 rounded-xl animate-pulse ${className}`}></div>
  );
};
