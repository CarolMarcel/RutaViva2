import { MapPin, Users } from "lucide-react";

interface DestinationCardProps {
  destination: {
    id: string;
    name: string;
    location: string;
    description: string;
    price_per_person: number;
    max_people: number;
    image: string;
  };
  onReserve: () => void;
}

export function DestinationCard({ destination, onReserve }: DestinationCardProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02] border border-gray-100">
      <div className="relative">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
          {formatCurrency(destination.price_per_person)}
        </div>
      </div>

      <div className="p-5 flex flex-col justify-between h-[260px]">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">{destination.name}</h3>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4 mr-1 text-blue-500" />
            {destination.location}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {destination.description}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1 text-gray-400" />
            Máx. {destination.max_people} personas
          </div>
        </div>

        <button
          onClick={onReserve}
          className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reservar Ahora
        </button>
      </div>
    </div>
  );
}

