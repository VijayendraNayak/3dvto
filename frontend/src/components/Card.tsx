import React from 'react';

interface ClothItem {
  name: string; // Changed to lowercase string
  category: string; // Corrected the property name
  price: string; // Assuming price is passed as a string, change to number if needed
  color: string;
  sizes: string; // Changed to an array of strings
  stock: string;
  thumbnail_path: string; // Added this property for the image URL
}

const Card: React.FC<{ item: ClothItem }> = ({ item }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h4 className="text-xl font-semibold">{item.name}</h4>
      <p>Category: {item.category}</p>
      <p>Price: ${item.price}</p>
      <p>Color: {item.color}</p>
      <p>Sizes: {item.sizes}</p> {/* Joining array into a string */}
      <p>Stock: {item.stock}</p>
      <img
        src={item.thumbnail_path}
        alt={item.name}
        className="w-32 h-32 object-cover mt-2 rounded-md"
      />
    </div>
  );
};

export default Card;
