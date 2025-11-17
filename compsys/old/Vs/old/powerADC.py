import time
from machine import ADC, Pin

# Set up ADC pins
adcV = ADC(Pin(26))  # Voltage sensor pin
adcI = ADC(Pin(27))  # Current sensor pin

# Constants for scaling
V_ref = 3.3           # Reference voltage for the ADC
adc_max = 65535       # Maximum ADC value for 16-bit ADC
current_scale = 0.01  # Scale factor for current (you might need to adjust based on your sensor)
voltage_scale = V_ref / adc_max  # Scale factor for voltage sensor

# Time interval for energy calculation (in seconds)
time_interval = 0.1  # Sampling every 0.1 seconds
total_duration = 20   # Total duration for the loop in seconds
period_duration = 5   # Duration for averaging energy (in seconds)

# Variables for energy calculation
energy_accumulated = 0  # Accumulated energy for the current period
energy_values = []      # List to store energy for each 5-second period
samples_per_period = int(period_duration / time_interval)  # Number of samples per 5 seconds

# Start time
start_time = time.ticks_ms()
elapsed_time = 0

# Open the text file for writing (append mode to store results after each period)
with open('energy_data.txt', 'w') as file:
    # Write header
    file.write("Energy Data for 20 Seconds\n")
    file.write("Period (s), Average Energy (J)\n")
    
    while elapsed_time < total_duration * 1000:
        # Read the voltage and current ADC values
        adc_voltage = adcV.read_u16()
        adc_current = adcI.read_u16()
        
        # Convert ADC values to actual voltage and current
        voltage = adc_voltage * voltage_scale   # Voltage in Volts
        current = adc_current * current_scale   # Current in Amperes
        
        # Calculate power
        power = voltage * current               # Power in Watts
        
        # Calculate energy in Joules for this interval
        energy = power * time_interval          # Energy in Joules
        energy_accumulated += energy
        
        # Check if it's time to store the average energy (after every 5 seconds)
        if (time.ticks_diff(time.ticks_ms(), start_time) // 1000) % period_duration == 0 and \
           (time.ticks_diff(time.ticks_ms(), start_time) // 1000) != elapsed_time // 1000:
            # Store the average energy for the last 5 seconds
            avg_energy = energy_accumulated / samples_per_period  # Average energy
            energy_values.append(avg_energy)
            
            # Write the result to the file
            file.write(f"{period_duration * len(energy_values)} seconds, {avg_energy:.4f} J\n")
            
            # Reset accumulated energy for the next period
            energy_accumulated = 0
            
            # Print the energy and average energy for this 5-second period
            print(f"Average energy for last 5 seconds: {avg_energy:.4f} J")
        
        # Increment the elapsed time
        elapsed_time = time.ticks_diff(time.ticks_ms(), start_time)
        
        # Sleep for the next sampling period (0.1 seconds)
        time.sleep(time_interval)

# After the loop finishes, print the energy data over 20 seconds
print("\nEnergy data over 20 seconds:")
for i, avg_energy in enumerate(energy_values, 1):
    print(f"Period {i * period_duration} seconds: Average energy = {avg_energy:.4f} J")
