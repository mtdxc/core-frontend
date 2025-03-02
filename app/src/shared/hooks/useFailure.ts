import { useState, useCallback } from 'react'
import type { UseStateTuple } from '$shared/types/common-types'
import '$shared/types/common-types'
import useIsMounted from '$shared/hooks/useIsMounted'
export default () => {
    const [failure, setFailure]: UseStateTuple<any> = useState()
    const isMounted = useIsMounted()

    if (failure) {
        throw failure
    }

    return useCallback(
        (value: any) => {
            if (isMounted()) {
                setFailure(value)
            }
        },
        [isMounted],
    )
}
