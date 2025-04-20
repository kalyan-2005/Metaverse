import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { instance } from "../api/axios";
import { FaUserAstronaut } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { FaSignOutAlt } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { SlOptionsVertical } from "react-icons/sl";
import CreateSpaceModal from "./spaces/CreateSpaceModal";

export default function Dashboard() {
  const { clearToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };
  const [user, setUser] = useState<{
    username: string;
    type: string;
    avatarId: string;
  }>();
  const [spaces, setSpaces] = useState<{id: string; name: string; thumbnail: string; dimensions: string}[]>([]);
  const [tab, setTab] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    instance
      .get("/user/currentUser")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Error fetching user:", err));
    instance
      .get("/space/all")
      .then((res) => setSpaces(res.data.spaces || []))
      .catch((err) => console.error("Error fetching spaces:", err));
  }, []);
  const handleSpaceCreated = () => {
    setModalOpen(false);
  };

  return (
    <div className="">
      {/* Home Navbar */}
      <div className="flex justify-between items-center bg-indigo-400 py-4 px-12 sticky top-0 z-50">
        <div>
          <a href="/" className="font-bold text-xl">
            LOGO
          </a>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 hover:bg-purple-200/50 p-2 rounded-md cursor-pointer px-4 duration-300">
            {!user?.avatarId ? (
              <h1 className="bg-blue-500 text-white p-1 rounded-full shadow-md">
                <FaUserAstronaut />
              </h1>
            ) : (
              <img
                src={user.avatarId || "placeholder.png"}
                alt="User Avatar"
                className="w-10 h-10 rounded-full"
              />
            )}
            {!user ? (
              <h1>Loading...</h1>
            ) : (
              <h1 className="font-semibold">{user.username}</h1>
            )}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-600/80 p-2 rounded-md cursor-pointer px-4 duration-300 font-semibold"
          >
            <IoMdAddCircle /> Create Space
          </button>
          <CreateSpaceModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSpaceCreated={handleSpaceCreated}
          />
          <button className="cursor-pointer" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </div>
      {/* Dashboard */}
      <div className="px-12 py-4 bg-indigo-800/50 min-h-screen z-40">
        {/* Tabs */}
        <div className="flex gap-6 justify-end">
          <button
            onClick={() => setTab(!tab)}
            className={`p-2 px-4 rounded-md font-semibold ${!tab ? "bg-indigo-600/50 text-white" : "text-white/40 cursor-pointer"}`}
          >
            My Spaces
          </button>
          <button
            onClick={() => setTab(!tab)}
            className={`p-2 px-4 rounded-md font-semibold ${tab ? "bg-indigo-600/50 text-white" : "text-white/40 cursor-pointer"}`}
          >
            Visited Spaces
          </button>
          <div className="flex items-center border-2 border-indigo-600/50 rounded-md">
            <h1 className="p-1 px-2">
              <FaSearch />
            </h1>
            <input type="text" placeholder="Search" className="outline-none" />
          </div>
        </div>
        {/* Spaces */}
        <div>
          <div className="grid grid-cols-3 gap-6 mt-6 md:grid-cols-4">
            {spaces.map((space,ind) => (
              <div key={ind} className="rounded-x relative">
                <img
                  src={space.thumbnail || "/thumbnail.png"}
                  alt="Space"
                  className="w-full h-40 object-cover cursor-pointer rounded-t-xl"
                  onClick={() => navigate(`/space/${space.id}`)}
                />
                <div className="my-2 flex justify-between items-center">
                  <h1 className="font-semibold">{space.name}</h1>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-semibold text-gray-700">
                      2 days ago
                    </h1>
                    <div className="p-1.5 rounded-md hover:bg-purple-600/30 cursor-pointer">
                      <SlOptionsVertical />
                    </div>
                  </div>
                </div>
                <div className="absolute top-1 left-1 bg-black/70 text-white px-2 rounded-full flex gap-1 items-center text-sm">
                  <span className="w-3 h-3 rounded-full bg-green-500" />4
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
