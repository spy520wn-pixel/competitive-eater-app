let idCounter = Date.now()
function generateId() {
  return (++idCounter).toString(36)
}

export function createShop({ name, category = '自助餐', city = '', address = '', mealTimeLimit = 90, location = null, cost = '', photos = [], rating = '' }) {
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
    cost,
    photos,
    rating,
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

export function createRecord({ shopId, shopName, tierId = '', tierName = '', diners = 1 }) {
  return {
    id: generateId(),
    shopId,
    shopName,
    tierId,
    tierName,
    diners,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    status: '进行中',
    items: [],
    photos: [],
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

export function createCreation({ type, recordId, shopName, style, prompt, inputPhotos }) {
  return {
    id: generateId(),
    type,
    recordId: recordId || '',
    shopName: shopName || '',
    style: style || '',
    prompt: prompt || '',
    status: 'generating',
    resultUrl: '',
    inputPhotos: inputPhotos || [],
    videoId: '',
    createdAt: new Date().toISOString()
  }
}
