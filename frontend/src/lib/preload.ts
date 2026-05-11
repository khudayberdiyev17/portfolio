import { api } from '@/lib/api'

type PrefetchCache = {
  about?: any
  education?: any[]
  experienceSummary?: any
  experienceItems?: any[]
  projects?: any[]
  certificates?: any[]
  socials?: any[]
}

const cache: PrefetchCache = {}
let bootPromise: Promise<PrefetchCache> | null = null

export function bootstrapPortfolioData(): Promise<PrefetchCache> {
  if (bootPromise) return bootPromise

  bootPromise = Promise.allSettled([
    api.get('/about-me/'),
    api.get('/education/'),
    api.get('/experience/'),
    api.get('/experience-item/'),
    api.get('/projects/'),
    api.get('/certificates/'),
    api.get('/social/'),
  ]).then(([about, education, expSummary, expItems, projects, certs, socials]) => {
    if (about.status === 'fulfilled') cache.about = about.value.data
    if (education.status === 'fulfilled') cache.education = education.value.data || []
    if (expSummary.status === 'fulfilled') cache.experienceSummary = expSummary.value.data
    if (expItems.status === 'fulfilled') cache.experienceItems = expItems.value.data || []
    if (projects.status === 'fulfilled') cache.projects = projects.value.data || []
    if (certs.status === 'fulfilled') cache.certificates = certs.value.data || []
    if (socials.status === 'fulfilled') cache.socials = socials.value.data || []
    return cache
  })

  return bootPromise
}

export function getPrefetchedData(): PrefetchCache {
  return cache
}
