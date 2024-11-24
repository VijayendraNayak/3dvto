import ModelViewer from './ModelViewer'; // Assuming ModelViewer is in the same directory

type ModelPopupProps = {
  modelUrl: string;
  onClose: () => void;
};

const ModelPopup: React.FC<ModelPopupProps> = ({ modelUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-5/6 h-5/6 max-w-4xl max-h-[800px]">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-60 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600"
        >
          ✕
        </button>
        <div className="w-full h-full">
          <ModelViewer 
            modelUrl={modelUrl} 
            backgroundColor={0xf0f0f0} 
            rotationSpeed={0.005} 
          />
        </div>
      </div>
    </div>
  );
};

export default ModelPopup;