
const ChartCaption = () => {
  return (
    <div className="text-center bg-blue-50 rounded-lg border border-blue-100 p-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-blue-600 text-lg">📈</span>
        <p className="text-blue-800 font-semibold">
          Percentual de visitantes por região turística do MS
        </p>
      </div>
      <p className="text-blue-600 text-sm">
        Passe o mouse sobre as barras para informações detalhadas de cada região
      </p>
    </div>
  );
};

export default ChartCaption;
