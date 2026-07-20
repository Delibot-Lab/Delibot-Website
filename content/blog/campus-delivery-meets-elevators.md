---
title: "엘리베이터를 타는 로봇: NRF24L01 무선 제어로 층간 이동하기"
date: "2026-07-20"
slug: "campus-delivery-meets-elevators"
excerpt: "Arduino Nano와 NRF24L01 무선 모듈로 만든 Elevator-Controller-PCB가 어떻게 Delibot의 층간 이동을 책임지는지 소개합니다."
tags: ["hardware", "pcb"]
author: "CBSH DeliBot Lab"
---

캠퍼스 배달은 한 층 안에서 끝나지 않습니다. 목적지가 다른 층이면 로봇도 결국 엘리베이터를 타야 하죠. 그래서 Delibot 팀은 구동 로봇과는 별도로, 미니 엘리베이터 모형을 무선으로 직접 제어하는 보드를 설계했습니다.

## 보드 구성

![Delibot Elevator Controller 3D 렌더](/elevator-board-render.png)

`Elevator-Controller-PCB`는 Arduino Nano를 중심으로 한 2계층 보드입니다.

- **Arduino Nano v3.x** — 메인 컨트롤러
- **NRF24L01 브레이크아웃** — 2.4GHz 무선 송수신 모듈
- **서보 모터 2개** — 각각 엘리베이터 문 개폐와 층 이동(카 구동) 담당
- **부저 + LED 3개(전원/디버그/에러)** — 현재 상태를 소리와 빛으로 알림

KiCad로 설계했고, 2계층 보드로 DRC 위반 0건을 확인한 뒤 JLCPCB로 발주했습니다.

![PCB 레이아웃](/elevator-pcb-layout.png)

## 왜 유선이 아니라 무선인가

구동 로봇과 엘리베이터 컨트롤러는 물리적으로 분리되어 있어야 합니다. 로봇은 계속 움직이고, 엘리베이터 쪽 보드는 엘리베이터 모형에 고정되어 있기 때문입니다. 그래서 둘 사이는 케이블 대신 NRF24L01 2.4GHz 무선 링크로 연결했습니다. 로봇이 엘리베이터 앞에 도착하면 간단한 명령 프레임을 무선으로 보내 문을 열고, 원하는 층으로 이동을 요청하는 방식입니다.

## 회로도

전체 회로는 MCU/전원, 디버그(LED·부저), 서보, 무선(NRF24L01) 네 블록으로 나뉩니다.

![회로도](/elevator-schematic.jpg)

## 다음 단계

지금은 서보 2개로 문 개폐와 층 이동을 흉내 낸 축소 모형 단계입니다. 앞으로는 이 보드를 Delibot의 라즈베리파이 쪽과 연동해서, 로봇이 목적지 층을 스스로 판단하고 엘리베이터를 호출하는 과정까지 자동화할 계획입니다.
