export const siteConfig = {
  name: "Delibot",
  labName: "CBSH DeliBot Lab",
  tagline: "캠퍼스를 누비는 배달 로봇",
  description:
    "CBSH DeliBot Lab이 만드는 캠퍼스 내부 자율주행 배달 로봇, Delibot을 소개합니다.",
  githubOrgUrl: "https://github.com/Delibot-Lab",
  nav: [
    { label: "소개", href: "/about" },
    { label: "블로그", href: "/blog" },
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
} as const;
