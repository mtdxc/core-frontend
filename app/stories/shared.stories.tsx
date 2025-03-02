/* eslint-disable react/no-multi-comp */
import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import StoryRouter from 'storybook-react-router'
import styles from '@sambego/storybook-styles'
import { Row, Col } from 'reactstrap'
import { arrayMove } from 'react-sortable-hoc'
import Toggle from '$shared/components/Toggle'
import Checkbox from '$shared/components/Checkbox'
import SortableList from '$shared/components/SortableList'
import FieldList from '$shared/components/FieldList'
import FieldItem from '$shared/components/FieldList/FieldItem'
import Dialog from '$shared/components/Dialog'
import BackButton from '$shared/components/BackButton'
import SvgIcon from '$shared/components/SvgIcon'
import PngIcon from '$shared/components/PngIcon'
import Slider from '$shared/components/Slider'
import { Provider as ModalPortalProvider } from '$shared/contexts/ModalPortal'
import ErrorDialog from '$mp/components/Modal/ErrorDialog'
import Notifications from '$shared/components/Notifications'
import Notification from '$shared/utils/Notification'
import { NotificationIcon } from '$shared/utils/constants'
import Spinner from '$shared/components/Spinner'
import Text from '$ui/Text'
import sharedStyles from './shared.pcss'

const story = (name: string) =>
    storiesOf(`Shared/${name}`, module)
        .addDecorator(
            styles({
                color: '#323232',
                padding: '15px',
            }),
        )

class ToggleContainer extends React.Component {
    state = {
        value: false,
    }

    render() {
        return (
            <Toggle
                value={this.state.value}
                onChange={(value) => {
                    this.setState({
                        value,
                    })
                    action('onChange')(value)
                }}
            />
        )
    }
}

story('Toggle')
    .add('changeable', () => <ToggleContainer />)
    .add('off', () => <Toggle value={false} onChange={action('onChange')} />)
    .add('on', () => <Toggle value={true} onChange={action('onChange')} />)

class CheckboxContainer extends React.Component {
    constructor() {
        super()
        this.state = {
            checked: false,
        }
    }

    render() {
        return (
            <Checkbox
                value={this.state.checked}
                onChange={(e) => {
                    this.setState({
                        checked: e.target.checked,
                    })
                    action('checked')(e)
                }}
            />
        )
    }
}

story('Checkbox')
    .add('checked', () => <Checkbox value={true} />)
    .add('unchecked', () => <Checkbox value={false} />)
    .add('changeable', () => <CheckboxContainer />)

class SortableListContainer extends React.Component {
    state = {
        items: Array(5)
            .fill(true)
            .map((v, i) => `Item #${i}${i === 0 ? ' (Drag me!)' : ''}`),
    }
    onSortEnd = ({ newIndex, oldIndex }) => {
        this.setState(({ items }) => ({
            items: arrayMove(items, oldIndex, newIndex),
        }))
    }

    render() {
        const { items } = this.state
        return (
            <SortableList onSortEnd={this.onSortEnd} lockAxis="y">
                {items.map((item) => (
                    <span key={item}>{item}</span>
                ))}
            </SortableList>
        )
    }
}

class FieldListContainer extends React.Component {
    state = {
        items: ['Name', 'Price', 'Comment', 'Created at', 'Updated at'],
    }
    onSortEnd = ({ newIndex, oldIndex }) => {
        this.setState(({ items }) => ({
            items: arrayMove(items, oldIndex, newIndex),
        }))
    }

    render() {
        const { items } = this.state
        return (
            <div className={sharedStyles.fieldList}>
                <FieldList onSortEnd={this.onSortEnd} lockAxis="y">
                    {items.map((item) => (
                        <FieldItem key={item} name={item}>
                            <Text defaultValue={item} />
                        </FieldItem>
                    ))}
                </FieldList>
            </div>
        )
    }
}

story('Sortable list')
    .add('basic', () => (
        <SortableListContainer>
            <div>Item 1</div>
            <div>Item 2</div>
            <div>Item 3</div>
            <div>Item 4</div>
        </SortableListContainer>
    ))
    .add('field list', () => <FieldListContainer />)
story('Dialog').add('basic', () => {
    const actions = {}

    if (true) {
        actions.cancel = {
            title: 'Cancel',
            kind: 'link',
            onClick: action('onDismiss'),
        }
    }

    if (true) {
        const waitingForSave = false
        actions.ok = {
            title: waitingForSave ? 'Saving....' : 'Save',
            kind: 'primary',
            onClick: action('onSave'),
            disabled: waitingForSave,
            spinner: waitingForSave,
        }
    }

    return (
        <Dialog
            showCloseIcon={true}
            waiting={false}
            title={'Dialog Title'}
            actions={actions}
        >
            Content goes here...
        </Dialog>
    )
})
story('BackButton')
    .addDecorator(StoryRouter())
    .add('basic', () => (
        <div>
            <BackButton />
            <hr />
        </div>
    ))
story('SvgIcon').add('all', () => (
    <Row>
        {SvgIcon.names.map((name) => (
            <Col xs="4" key={name}>
                <div key={name} className={sharedStyles.iconWrapper}>
                    <div className={sharedStyles.iconInner}>
                        <SvgIcon name={name} className={sharedStyles.svgIcon} />
                    </div>
                    <span>{name}</span>
                </div>
            </Col>
        ))}
        <Col xs="4">
            <div className={sharedStyles.iconWrapper}>
                <div className={sharedStyles.iconInner}>
                    <SvgIcon name="checkmark" size="large" className={sharedStyles.svgIcon} />
                </div>
                <span>checkmark size=large</span>
            </div>
        </Col>
    </Row>
))
story('PngIcon').add('all', () => (
    <Row>
        {PngIcon.names.map((name) => (
            <Col xs="4" key={name}>
                <div key={name} className={sharedStyles.iconWrapper}>
                    <div className={sharedStyles.iconInner}>
                        <PngIcon name={name} className={sharedStyles.pngIcon} />
                    </div>
                    <span>{name}</span>
                </div>
            </Col>
        ))}
    </Row>
))

class SliderContainer extends React.Component {
    state = {
        sliderValue: 1,
    }
    onChange = (value) => {
        this.setState({
            sliderValue: value,
        })
    }

    render() {
        return (
            <div>
                <Slider min={1} max={100} value={this.state.sliderValue} onChange={this.onChange} />
                <div
                    style={{
                        color: '#323232',
                    }}
                >
                    Slider value: {this.state.sliderValue}
                </div>
            </div>
        )
    }
}

story('Slider').add('basic', () => <SliderContainer />)
story('ModalPortal')
    .addDecorator(StoryRouter())
    .add('basic', () => (
        <React.Fragment>
            <div id="modal-root" />
            <ModalPortalProvider>
                <h1>Lorem ipsum cause dolor sit emat!</h1>
                {<ErrorDialog title="Godlike!" message="Hello world!" onClose={() => {}} />}
            </ModalPortalProvider>
        </React.Fragment>
    ))
story('Notifications').add('basic', () => {
    const title = 'Lorem ipsum dolor sit. But hey, you always have emat!'
    return (
        <React.Fragment>
            <div id="modal-root" />
            <ModalPortalProvider>
                <button
                    type="button"
                    onClick={() => {
                        Notification.push({
                            title,
                        })
                    }}
                >
                    Add notification
                </button>
                {Object.values(NotificationIcon).map((icon) => (
                    <button
                        key={icon}
                        type="button"
                        onClick={() => {
                            Notification.push({
                                title,
                                icon,
                            })
                        }}
                    >
                        Add {icon} notification
                    </button>
                ))}
                <Notifications />
                {(
                    <ErrorDialog title="Godlike!" message="Hello world!" onClose={() => {}} />
                )}
            </ModalPortalProvider>
        </React.Fragment>
    )
})
story('Spinner')
    .add('Small', () => <Spinner size="small" />)
    .add('Large', () => <Spinner size="large" />)
    .add('Green', () => <Spinner color="green" />)
    .add('White', () => <Spinner color="white" />)
