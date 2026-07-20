import { Box, Plug, Code2, Server } from "lucide-react";

export const siteConfig = {
  name: "Delibot",
  labName: "CBSH DeliBot Lab",
  tagline: "캠퍼스를 누비는 배달 로봇",
  description:
    "CBSH DeliBot Lab이 만드는 캠퍼스 내부 자율주행 배달 로봇, Delibot을 소개합니다.",
  githubOrgUrl: "https://github.com/Delibot-Lab",
  contactEmail: "delibot.lab@gmail.com",
  nav: [
    { label: "소개", href: "/about" },
    { label: "블로그", href: "/blog" },
    { label: "팀원 모집", href: "/join" },
  ],
  repos: [
    {
      name: "Delibot-Controller",
      description: "STM32 기반 구동 제어 펌웨어",
      url: "https://github.com/Delibot-Lab/Delibot-Controller",
    },
    {
      name: "Delibot-Controller-RPi-Library",
      description: "라즈베리파이용 Python 제어 라이브러리",
      url: "https://github.com/Delibot-Lab/Delibot-Controller-RPi-Library",
    },
    {
      name: "Delibot-Configurator",
      description: "브라우저 기반 로봇 보정/설정 도구",
      url: "https://github.com/Delibot-Lab/Delibot-Configurator",
    },
    {
      name: "Elevator-Controller-PCB",
      description: "층간 이동용 미니 엘리베이터 무선 제어 보드",
      url: "https://github.com/Delibot-Lab/Elevator-Controller-PCB",
    },
  ],
  recruitTeams: [
    {
      id: "modeling",
      icon: Box,
      label: "모델링팀",
      description: "로봇 섀시와 구동부의 3D/메커니컬 설계를 맡습니다.",
    },
    {
      id: "circuit",
      icon: Plug,
      label: "회로팀",
      description: "KiCad 기반 PCB 설계와 전장 시스템을 담당합니다.",
    },
    {
      id: "programming",
      icon: Code2,
      label: "프로그래밍팀",
      description: "펌웨어, 라즈베리파이 연동 등 로봇 소프트웨어를 개발합니다.",
    },
    {
      id: "server",
      icon: Server,
      label: "서버팀",
      description: "웹사이트와 백엔드 인프라를 만들고 운영합니다.",
    },
  ],
} as const;
