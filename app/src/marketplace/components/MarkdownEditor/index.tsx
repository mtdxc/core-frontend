import React, { useState, useCallback, useEffect } from 'react'
import cx from 'classnames'
import Text from '$ui/Text'
import Errors from '$ui/Errors'
import type { LastErrorProps } from '$shared/hooks/useLastError'
import { useLastError } from '$shared/hooks/useLastError'
import styles from './markdownEditor.pcss'
type Props = LastErrorProps & {
    value?: string
    placeholder?: string
    onChange?: (arg0: string) => void
    className?: string
    disabled?: boolean
}

const MarkdownEditor = ({ value, onChange, error, isProcessing, className, disabled, ...editorProps }: Props) => {
    const [text, setText] = useState(value || '')
    const [wordCount, setWordCount] = useState(0)
    const { hasError, error: lastError } = useLastError({
        error,
        isProcessing,
    })
    const onTextChange = useCallback(
        (e: React.SyntheticEvent<EventTarget>) => {
            const { value: newValue } = e.target
            setText(newValue)

            if (onChange != null) {
                onChange(newValue)
            }
        },
        [onChange],
    )
    useEffect(() => {
        const trimmedValue = text.trim()
        setWordCount(trimmedValue.length > 0 ? trimmedValue.split(/\s+/g).length : 0)
    }, [text])
    return (
        <React.Fragment>
            <div
                className={cx(
                    styles.root,
                    {
                        [styles.withError]: !!hasError,
                        [styles.disabled]: !!disabled,
                    },
                    className,
                )}
            >
                <Text
                    {...editorProps}
                    disabled={!!disabled}
                    unstyled
                    className={styles.input}
                    onChange={onTextChange}
                    tag="textarea"
                    value={value}
                />
                <div className={styles.footer}>
                    <div>
                        <span className={styles.bold}>**bold**</span>
                        <span className={styles.italic}>*italics*</span>
                        <span className={styles.code}>`code`</span>
                        <span>&gt;quote</span>
                        <span>* bullet point</span>
                    </div>
                    <div className={styles.wordCount}>{wordCount} words</div>
                </div>
            </div>
            <Errors>{hasError && lastError}</Errors>
        </React.Fragment>
    )
}

export default MarkdownEditor
