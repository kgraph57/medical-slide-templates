function rounded(value) {
  return Number(value.toFixed(6))
}

export function radialPositions(count, radius, itemSize = 100) {
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError('radial item count must be a positive safe integer')
  if (typeof radius !== 'number' || !Number.isFinite(radius) || radius <= 0) throw new RangeError('radial radius must be positive')
  if (typeof itemSize !== 'number' || !Number.isFinite(itemSize) || itemSize <= 0) throw new RangeError('radial itemSize must be positive')
  return Array.from({ length: count }, (_, index) => {
    const angle = (2 * Math.PI * index / count) - Math.PI / 2
    return {
      x: rounded(Math.cos(angle) * radius),
      y: rounded(Math.sin(angle) * radius),
      offset: rounded(itemSize / 2),
    }
  })
}

export function layoutRadials(root = document) {
  const radials = root.matches?.('.radial') ? [root] : [...root.querySelectorAll('.radial')]
  for (const radial of radials) {
    const items = [...radial.querySelectorAll('.radial-item')]
    if (items.length === 0) continue
    const radius = Number.parseFloat(radial.dataset.radius || '160')
    const itemSize = Number.parseFloat(radial.dataset.itemSize || '100')
    radialPositions(items.length, radius, itemSize).forEach((position, index) => {
      const x = position.x >= 0 ? `+ ${position.x}px` : `- ${Math.abs(position.x)}px`
      const y = position.y >= 0 ? `+ ${position.y}px` : `- ${Math.abs(position.y)}px`
      items[index].style.left = `calc(50% ${x} - ${position.offset}px)`
      items[index].style.top = `calc(50% ${y} - ${position.offset}px)`
    })
  }
}
