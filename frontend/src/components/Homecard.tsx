import React from "react";

interface ClothItem {
  name: string;
  category: string;
  price: string;
  color: string;
  sizes: string;
  stock: string;
  thumbnail_path: string;
  _id: string;
}

const Homecard: React.FC<{ item: ClothItem }> = ({ item }) => {
  return (
    <div className="border p-4 rounded-lg shadow-lg bg-white w-48 h-72 flex flex-col">
      <div className="flex justify-center items-center h-36 bg-gray-100 rounded-md overflow-hidden">
        <img
          src={item.thumbnail_path}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="mt-3 text-lg font-semibold text-center text-gray-800 truncate">
        {item.name}
      </div>

      <div className="mt-2 text-center text-gray-600 font-medium">
        Price: <span className="text-green-600 font-bold">${item.price}</span>
      </div>

      <button className="mt-auto bg-blue-500 text-white font-semibold py-2 rounded-md w-full hover:bg-blue-600 transition-all">
        Try
      </button>
    </div>
  );
};

export default Homecard;
