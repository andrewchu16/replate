from pololu_3pi_2040_robot import robot
import time

motors = robot.Motors()
imu = robot.IMU()
imu.reset()
imu.enable_default()

def turn_robot(degrees, speed=1000, kp=100, kd=4):
    """
    Turns the robot to a specified angle (in degrees).
    Positive values turn clockwise, negative values counterclockwise.
    """
    robot_angle = 0.0
    target_angle = degrees
    last_time_gyro_reading = time.ticks_us()
    drive_motors = True

    while drive_motors:
        # Update the angle and turn rate
        if imu.gyro.data_ready():
            imu.gyro.read()
            turn_rate = imu.gyro.last_reading_dps[2]  # degrees per second
            now = time.ticks_us()
            dt = time.ticks_diff(now, last_time_gyro_reading)
            robot_angle += turn_rate * dt / 1000000
            last_time_gyro_reading = now

        # Check if the turn is complete
        if abs(robot_angle - target_angle) < 3:
            drive_motors = False
            motors.off()
            break

        # Calculate the turn speed
        turn_speed = (target_angle - robot_angle) * kp - turn_rate * kd
        turn_speed = max(min(turn_speed, speed), -speed)

        # Drive motors to turn the robot
        motors.set_speeds(-turn_speed, turn_speed)

        time.sleep_ms(10)

    motors.off()
    time.sleep_ms(50)

