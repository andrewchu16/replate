from pololu_3pi_2040_robot import robot
import time

from pid_turn import turn_robot
from pid_drive import drive_robot

button_a = robot.ButtonA()
bump_sensors = robot.BumpSensors()
bump_sensors.calibrate()
buzzer = robot.Buzzer()

drive_robot(5) 
turn_robot(180)

while True:
    bump_sensors.read()
    if bump_sensors.left_is_pressed() or bump_sensors.right_is_pressed():
        break;

    time.sleep_ms(50)

drive_robot(5) 