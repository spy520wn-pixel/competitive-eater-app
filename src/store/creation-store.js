import { Storage } from './storage'
import { createCreation } from './models'

const creationStorage = new Storage('creations')

export const creationStore = {
  getAll() {
    return creationStorage.getAll()
  },

  getById(id) {
    return creationStorage.getById(id)
  },

  getByType(type) {
    return creationStorage.getAll()
      .filter(c => c.type === type)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  create(creationData) {
    const creation = createCreation(creationData)
    creationStorage.save(creation)
    return creation
  },

  update(id, updates) {
    creationStorage.update(id, updates)
  },

  delete(id) {
    creationStorage.remove(id)
  },

  getGenerating() {
    return creationStorage.getAll().filter(c => c.status === 'generating')
  }
}
