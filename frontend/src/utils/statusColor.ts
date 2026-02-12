export const getStatusColor = (status: string) => {
  switch (status) {
    case 'WISHLIST':
      return 'bg-pink-100 text-pink-600 hover:bg-pink-200 hover:text-pink-800 hover:transition-all hover:scale-110'
    case 'PLANNED':
      return 'bg-purple-100 text-purple-600 hover:bg-purple-200 hover:text-purple-800 hover:transition-all hover:scale-110'
    case 'ORGANIZED':
      return 'bg-amber-100 text-amber-600 hover:bg-amber-200 hover:text-amber-800 hover:transition-all hover:scale-110'
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:text-emerald-800 hover:transition-all hover:scale-110'
  }
}
