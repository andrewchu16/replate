from pololu_3pi_2040_robot import robot
import time

motors = robot.Motors()
imu = robot.IMU()
imu.reset()
imu.enable_default()

def drive_robot(duration, speed=1000, kp=100):
    """
    Drive straight for a given time (in seconds) using heading-based P-control.

    How it works:
    1. We integrate the gyroscope's turn rate to track the robot's heading (in degrees).
    2. We apply a proportional correction (kp * -heading) to keep the heading near zero.
    3. Adjust 'kp' if the robot drifts or oscillates:
       - If it drifts too much, increase kp slightly.
       - If it oscillates back and forth, lower kp.

    Parameters:
      duration: Time in seconds to move straight.
      speed: Base speed for both motors.
      kp: Proportional gain for correcting heading (rather than turn rate).
    """
    start_time = time.ticks_ms()
    
    heading = 0.0
    last_time_us = time.ticks_us()
    
    while time.ticks_diff(time.ticks_ms(), start_time) < duration * 1000:
        # Wait for fresh gyro data
        while not imu.gyro.data_ready():
            pass
        
        # Read gyroscope and get turn rate (degrees/s) around Z axis
        imu.gyro.read()
        turn_rate = imu.gyro.last_reading_dps[2]

        # Compute time delta (in seconds)
        now_us = time.ticks_us()
        dt = time.ticks_diff(now_us, last_time_us) / 1e6
        last_time_us = now_us
        
        # Update heading by integrating turn rate
        # Positive turn_rate means heading increases
        heading += turn_rate * dt
        
        # Use heading-based proportional correction
        # Negative sign: if heading is positive, we steer back negatively.
        correction = kp * (-heading)
        
        # Calculate motor speeds
        left_speed = speed - correction
        right_speed = speed + correction
        
        # Limit speeds to [-speed, speed]
        left_speed = max(min(left_speed, speed), -speed)
        right_speed = max(min(right_speed, speed), -speed)
        
        motors.set_speeds(int(left_speed), int(right_speed))

        time.sleep_ms(10)
    
    # Stop motors after time has elapsed
    motors.off()
    time.sleep_ms(50)
