
const LoadingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white rounded-lg p-3 shadow-sm">
        <div className="flex space-x-2">
          <div className="h-2 w-2 rounded-full bg-ms-primary-blue/50 animate-bounce"></div>
          <div className="h-2 w-2 rounded-full bg-ms-primary-blue/50 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="h-2 w-2 rounded-full bg-ms-primary-blue/50 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
