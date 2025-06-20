// src/components/TestimonialCard.jsx
import React from "react"; // Asegúrate de que React está importado si no lo estaba

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <img
          src={testimonial.userImage || "/placeholder.svg"}
          alt={testimonial.userName}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h4 className="font-semibold">{testimonial.userName}</h4>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                // ¡¡¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÁ AQUÍ!!!
                data-testid={i < testimonial.rating ? "star-icon-filled" : "star-icon-empty"}
                className={`w-4 h-4 ${
                  i < testimonial.rating ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-600 italic">"{testimonial.text}"</p>
      <p className="mt-2 text-sm text-gray-500">
        Servicio: {testimonial.service}
      </p>
    </div>
  );
};

export default TestimonialCard;