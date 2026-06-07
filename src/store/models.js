let idCounter = Date.now()
function generateId() {
  return (++idCounter).toString(36)
}

export function createShop({ name, category = '自助餐', city = '', address = '', mealTimeLimit = 90, location = null }) {
  return {
    id: generateId(),
    name,
    address,
    category,
    city,
    location,
    mealTimeLimit,
    hasTiers: false,
    tiers: [],
    menu: [],
    createdAt: new Date().toISOString()
  }
}

export function createTier({ shopId, name }) {
  return {
    id: generateId(),
    shopId,
    name,
    menu: []
  }
}

export function createMenuItem({ shopId, tierId = '', name, category, unit }) {
  return {
    id: generateId(),
    shopId,
    tierId,
    name,
    category,
    unit
  }
}

export function createRecord({ shopId, shopName, tierId = '', tierName = '' }) {
  return {
    id: generateId(),
    shopId,
    shopName,
    tierId,
    tierName,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    status: '进行中',
    items: [],
    score: 0,
    createdAt: new Date().toISOString()
  }
}

export function createRecordItem({ menuItemId, name, category, quantity, unit }) {
  return {
    menuItemId,
    name,
    category,
    quantity,
    unit
  }
}
