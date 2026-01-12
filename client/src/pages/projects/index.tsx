import ThreeDCard from "@/components/base/ThreeDCard";
import { Button } from "antd";

const ProjectsList = [
  {
    name: "Chatty Room",
    description:
      "A real-time chat application featuring user authentication, bilingual internationalization, real-time user presence, and an intelligently sorted user list based on online status and chat history.",
    stack:
      "React · TypeScript · Node.js · WebSocket · Zustand · JWT · MongoDB · Axios · i18n · TailwindCSS · DaisyUI",
    url: "https://chat-app-244z.onrender.com/",
  },
  {
    name: "Chatty Room",
    description:
      "A real-time chat application featuring user authentication, bilingual internationalization, real-time user presence, and an intelligently sorted user list based on online status and chat history.",
    stack: "React · TypeScript · Node.js · WebSocket · JWT · MongoDB · i18n",
    url: "https://chat-app-244z.onrender.com/",
  },
];

const ProjectsPage = () => {
  return (
    <div className="px-6 py-4 grid grid-cols-3 gap-12">
      {ProjectsList.map((project, idx) => {
        const { name, description, stack, url } = project;
        return (
          <div
            key={idx}
            className="cursor-pointer"
            onClick={() => window.open(url, "_blank")}
          >
            <ThreeDCard className="h-full w-120 rounded-2xl p-6 bg-black text-white flex flex-col">
              <div className="min-h-16">
                {/* 固定标题区域高度，所有卡统一 */}
                <div className="text-2xl font-bold flex justify-between items-center">
                  <div>{name}</div>
                  <Button ghost onClick={() => window.open(url, "_blank")}>
                    Visit
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                {/* 可伸缩主体，占满中间 */}
                <p className="mb-2">Description:</p>
                <div className="text-sm">{description}</div>
              </div>

              <div className="min-h-16 mt-4 text-sm">
                {/* 底部区域（如果有） */}
                <p>Tech Stack:</p>
                <div>{stack}</div>
              </div>
            </ThreeDCard>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectsPage;
