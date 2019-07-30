import isEqual from 'lodash/isEqual'
import differenceWith from 'lodash/differenceWith'
import orderBy from 'lodash/orderBy'

const EMPTY = []

export function changedModules(canvasA, canvasB) {
    if (canvasA === canvasB || canvasA.modules === canvasB.modules) { return EMPTY }
    const modulesA = orderBy(canvasA.modules || [], 'hash')
    const modulesB = orderBy(canvasB.modules || [], 'hash')
    const AtoB = differenceWith(modulesA, modulesB, isEqual).map(({ hash }) => hash)
    const BtoA = differenceWith(modulesB, modulesA, isEqual).map(({ hash }) => hash)
    return Array.from(new Set([...AtoB, ...BtoA]))
}

export function isEqualCanvas(canvasA, canvasB) {
    if (canvasA === canvasB) { return true }
    const hasChangedModules = changedModules(canvasA, canvasB)
    if (hasChangedModules) { return false }
    // don't re-check modules
    return isEqual({
        ...canvasA,
        modules: [],
    }, {
        ...canvasB,
        modules: [],
    })
}
