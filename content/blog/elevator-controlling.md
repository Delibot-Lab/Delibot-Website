---
title: Elevator Controller 구상부터 회로 제작까지
date: '2026-07-20'
slug: elevator-controlling
excerpt: Elevator Controller 회로의 구상과 회로 구현까지의 이야기를 담고 있다.
tags:
  - elevator
  - pcb
  - radio
author: 이무원
---
# 시작 및 구상
이걸 만들기 시작한건 먼저 엘리베이터를 delibot이 제어할 수 있어야지 층간 이동이 될 것이기 때문이다. 처음 생각은 걍 엘리베이터 내부에 서보 쭉 달아서 서보로 버튼 눌러서 층 가는거였다. 근데 이러면 본관에 엘리베이터 2대, 창융동 엘리베이터 이 3대의 엘리베이터별로 서로 다른 3d 모델링을 해야한다. 그런데 이건 너무 비효율적이다. 그래서 내가 생각한 방법은 그냥 바깥쪽에 엘리베이터 호출 버튼만 만드는 것이다. 결국에 엘리베이터 호출 버튼이니까 이것만 있으면 모든 층에 갈 수 있기 때문이다! delibot이 1층에서 3층을 가고 싶다고 생각해 보자. 1층에 호출 버튼을 누르면 엘리베이터가 1층으로 올 것이다. 그러면 델리봇은 엘베 안에 탑승한다. 그리고 3층의 호출 버튼을 누르면 엘리베이터는 3층으로 갈 것이다. 그리고 엘리베이터에서 내린다. 자, 이제 3층에 왔다! 이런 식으로 구현하는 것이다!
![](https://mblogthumb-phinf.pstatic.net/MjAxNzA3MDZfNTIg/MDAxNDk5MzE0MDE1MDA5.r1lKQ5Un9x9_u_5bBLKCRKeL-tiOiCW344ty9Ay9SmQg.9YOJEd5A6EkyYKLw9xgmyDbI2PqIRTBy5DbawzPQ3ywg.GIF.kjraa1112/giphy_%2810%29.gif?type=w800)

# 부품 생각
그럼 이제 어떤 부품 쓸지 생각해야 한다. 일단 버튼을 누르기 위한 서보 2개가 필요하다. 통신을 위한 라디오 통신 모듈도 하나 필요하다. 전원용 스크류 터미널과 몇개의 led가 필요하고 delibot이 내릴꺼라는 경고를 위한 부저도 필요하다. 그리고 이들을 안전하게 사용하기 위한 저항, 커페시터, 다이오드 등도 필요하다.

# Schematic 작성
![schematic](https://github.com/Delibot-Lab/Elevator-Controller-PCB/blob/main/exports/elevatorController_page-0001.jpg?raw=true)
이게 schematic 이다. 단순히 위에서 나열한 부품들이 싹 배치돼 있고 회로 연결돼 있는 것이다. 보면 여러개의 디커플링들이 달려있다.
BOM은 다음과 같다!
| Ref | Part | Description |
|-----|------|-------------|
| A1 | Arduino Nano v3.x | Main controller |
| U1 | NRF24L01 Breakout | 2.4GHz radio transceiver |
| M1, M2 | Servo motors | Elevator actuation (3-pin headers) |
| BZ1 | Buzzer | Audible feedback |
| D1 | LED | Power indicator |
| D2 | LED | Debug indicator |
| D3 | LED | Error indicator |
| D4 | Diode | Protection |
| Q1 | S8050 NPN transistor | Switching |
| J1 | Terminal block (2-pin) | MCU power input |
| R2–R5 | Resistors (330Ω x3, 1kΩ) | LED/transistor biasing |
| C1, C2 | 470µF electrolytic | Power supply filtering |
| C3–C5 | 100nF ceramic | Decoupling |
| C6 | 10µF electrolytic | Filtering |

# PCB 아트웍
![PCB artwork](https://github.com/Delibot-Lab/Elevator-Controller-PCB/blob/main/exports/Screenshot%20From%202026-07-04%2000-35-02.png?raw=true)
다음으로 위와 같이 pcb 아트웍을 진행했다. 2레이어에 단면 PCB로 제작하였다. 모두 원가 절감을 위한 일이었다..... (돈 없어여....)
![](https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUyNTk1YTA2NGMwMXlnbHR5NDlieGxocWFoNmZpY3V6bnF1N3Jhc3JidSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3orifdO6eKr9YBdOBq/200w.gif)

그렇게 3시간의 노동을 한 결과 아래와 같이 PCB를 만들 수 있었다..!
![PCB 3D](https://github.com/Delibot-Lab/Elevator-Controller-PCB/blob/main/exports/Screenshot%20From%202026-07-04%2000-35-45.png?raw=true)


# 막노동의 시간
이제 납땝을 하면 된다. 자습 3시간을 모두 갈아넣어 4명이 돌아가며 한 결과 아래와 같이 완벽한 PCB 5개를 만들었다...!! (다이오드 풋프린트 잘못 지정해서 어거지로 달음....)
![Real PCB](https://github.com/Delibot-Lab/Elevator-Controller-PCB/blob/main/exports/KakaoTalk_20260720_201619150.jpg?raw=true)

![](https://i.pinimg.com/originals/fa/b0/dc/fab0dc9e3a68347af1b85e56885816b4.gif)
