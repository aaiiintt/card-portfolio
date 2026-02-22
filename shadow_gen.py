def gen_shadow(max_dist):
    return ", ".join([f"{i}px {i}px 0 var(--dark)" for i in range(1, max_dist + 1)])

print("Unhovered (6px):")
print(gen_shadow(6))
print("\nHovered (9px):")
print(gen_shadow(9))
print("\nActive (3px):")
print(gen_shadow(3))
