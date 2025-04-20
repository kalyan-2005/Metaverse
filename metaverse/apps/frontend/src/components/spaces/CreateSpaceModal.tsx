import { useState, useEffect } from "react";
import { instance } from "../../api/axios";
import { useNavigate } from "react-router-dom";

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpaceCreated: () => void;
}

export default function CreateSpaceModal({
  isOpen,
  onClose,
  onSpaceCreated,
}: CreateSpaceModalProps) {
  const [name, setName] = useState("");
  const [dimensions, setDimensions] = useState("100x100");
  const [mapId, setMapId] = useState("");
  const [maps, setMaps] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      instance.get("/map/all").then((res) => {
        setMaps(res.data.maps || []);
      });
    }
  }, [isOpen]);

  const handleCreate = async () => {
    try {
      const body: { name: string; dimensions: string; mapId?: string } = {
        name,
        dimensions,
      };
      if (mapId) body.mapId = mapId;

      const response = await instance.post("/space", body);
      if (response.status !== 200) {
        alert("Something went wrong. Try again.");
        return;
      }
      navigate(`/space/${response.data.spaceId}`);
      onSpaceCreated();
      onClose();
    } catch (error) {
      console.error("Error creating space", error);
      alert("Something went wrong. Try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[400px] space-y-4">
        <h2 className="text-xl font-bold">Create a New Space</h2>
        <input
          type="text"
          placeholder="Space Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded-md outline-none"
        />
        <input
          type="text"
          placeholder="Dimensions (e.g. 100x100)"
          value={dimensions}
          onChange={(e) => setDimensions(e.target.value)}
          className="w-full border px-3 py-2 rounded-md outline-none"
        />
        <select
          value={mapId}
          onChange={(e) => setMapId(e.target.value)}
          className="w-full border px-3 py-2 rounded-md outline-none"
        >
          <option value="">Select a Map (Optional)</option>
          {maps.map((map: { id: string; name: string }) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
