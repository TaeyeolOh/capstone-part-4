import os
import bluetooth

stats = os.statvfs('/')
block_size = stats[0]
total_blocks = stats[2]
free_blocks = stats[3]

total_size = block_size * total_blocks
free_size = block_size * free_blocks

print("Total Storage: {:.2f} KB".format(total_size / 1024))
print("Free Storage: {:.2f} KB".format(free_size / 1024))