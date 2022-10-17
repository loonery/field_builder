import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Bootstrap imports for styling
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import {DropdownButton, FormCheck} from "react-bootstrap";
import {getElement} from "bootstrap/js/src/util";

/**
 * Form is a composite component that holds all components of the fieldBuilder form
 */
class FieldBuilderForm extends React.Component {

    constructor(props) {
        super(props);

        // parent component maintains the state of the entire form
        this.state = {
            labelValue: '',
            typeValue: 'Multi-Select',
            required: false,
            defaultValue: '',
            bufferedChoice: '',
            choicesString: '',
            choices: [],
            order: 'Display Choices in Alphabetical Order'
        }
        this.renderChoiceTextarea = this.renderChoiceTextarea.bind(this);
        this.handleInputBuffering = this.handleInputBuffering.bind(this);
        this.handleChoiceAddition = this.handleChoiceAddition.bind(this);
        this.handleChoiceRemoval = this.handleChoiceRemoval.bind(this);
    }

    /**
     * Handles the updating of the named input field when the user inputs information into that field.
     * Updates the global form to know what is stored in the field at any moment.
     */
    handleInputBuffering = (e) => {
        // set the state of the buffered choice
        const name = e.target.name;

        // if we're receiving checkbox input, we store a boolean value
        if (name === "required") {
            this.setState({[name]: e.target.checked});

        // if we're receiving text input, we store the text value in the form state
        } else {
            this.setState({[name]: e.target.value});
        }
    }

    /**
     * Handles the event when the 'Add Choice' button is clicked. Checks that the choice the user is trying to add
     * is not already in the list of choices, and that there are not too many inputs. If these checks are passed,
     * the user's buffered choice is added to the list.
     */
    handleChoiceAddition = () => {

        // get the user's attempted input and trim its whitespace (to avoid visual duplicates)
        let attemptedInput = this.state.bufferedChoice;
        attemptedInput = attemptedInput.trim();

        // get the current choices in the list from the global state
        let currentChoices = this.state.choices;

        /* choice input validation: */
        // determining validity of input based on constraints
        const duplicates = (currentChoices.includes(attemptedInput));
        const tooMany = currentChoices.length > 50;

        // ensure no duplicates
        if (duplicates) {
            alert("Duplicate choices: fields may not have duplicate choices.");

        // ensure there are not too many choices
        } else if (tooMany) {
            alert("Too many choices: Each field is only allowed up to 50 choices.");

        // blank and null guard the string input
        } else if (!attemptedInput) {
            alert("Blank or null input not permitted for field choices.");

        /* If input is valid, we add it to the state of this choices field */
        } else {
            // add choice to choices and reflect this in the form's state
            currentChoices.push(attemptedInput)
            this.setState({choices: currentChoices});

            // update existing value of visual textarea with the new buffered choice
            const newChoicesString = this.renderChoiceTextarea(currentChoices);
            this.setState({choicesString: newChoicesString});
        }

        // clear input buffer (data and visual)
        this.setState({bufferedChoice: ""});
        const choiceInputBuffer = getElement("#choiceInputBuffer"); choiceInputBuffer.value = "";
    }

    /**
     * Handles the event when the 'Remove Choice' button is clicked. Checks that the choice the user is not trying
     * to remove from an empty list of choices. If list of choices is not empty, pops the most-recently added choice
     * from the list of choices.
     */
    handleChoiceRemoval = () => {

        // get current state
        let currentChoices = this.state.choices;

        // check that there is anything to remove
        if (currentChoices.length <= 0) {
            alert("No more choices to remove");

            // if we can remove elements, do so...
        } else {

            // remove the most recent choice from the array
            currentChoices.pop();

            // update existing value of visual textarea without the deleted choice
            const newChoicesString = this.renderChoiceTextarea(currentChoices);

            // reset the string rendered in the choices textarea to contain the choices minus the one that was removed.
            this.setState({choicesString: newChoicesString});
        }
    }

    /**
     * Handles user clicking of submission button.
     */
    handleSubmit = () => {

        const defaultValue = this.state.defaultValue;
        let currentChoices = this.state.choices;
        const labelField = this.state.labelValue;

        //  if the label field is blank or null, the user cannot submit, and they are alerted as such
        if (!labelField) {
            alert("Submit error: 'Field Label' field is required. Form not submitted.");
            return;
        }

        //  if the default field is blank or null, the user cannot submit, and they are alerted as such
        if (!defaultValue) {
            alert("Submit error: 'Field Default Value' field is required. Form not submitted.");
            return;
        }

        //  if there is only one choice
        if (currentChoices.length <= 1 && !defaultValue) {
            alert("Submit error: 'Field Choices' must have at least 2 elements to produce a multi-select field. Form " +
                "not submitted.");
            return;
        }

        // if the default value the user has in the field is not null or blank, and it is not in the choices array,
        // place it in the choices array before submission
        if (defaultValue && !(currentChoices.includes(defaultValue))){

            // update the choices state array with the default value
            currentChoices.push(defaultValue); this.setState({choices: currentChoices})

            // update the string representation of the choices array and send it to state
            const newChoicesString = this.renderChoiceTextarea(currentChoices);
            this.setState({choicesString: newChoicesString});
        }

        const outputJSON = JSON.stringify({
            labelValue: this.state.labelValue,
            typeValue: 'Multi-Select',
            required: this.state.required,
            defaultValue: this.state.defaultValue,
            choices: this.state.choices,
            order: 'Display Choices in Alphabetical Order'
        })

        // log the console's data
        console.log(outputJSON);

        fetch("https://www.mocky.io/v2/566061f21200008e3aabd919", {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: outputJSON
        }).then((response) => {
            // alert on success
            console.log(response);
            alert("Form Submitted");
        })
    }

    /**
     * Handles the clearing of the builder form when the builder clicks the 'clear' button.
     */
    handleClear = (e) => {

        // hard-clear all input fields
        const choiceInputBuffer = getElement("#choiceInputBuffer"); choiceInputBuffer.value = "";
        const labelInputBuffer = getElement("#labelInputBuffer"); labelInputBuffer.value = "";
        const defaultInputBuffer = getElement("#defaultInputBuffer"); defaultInputBuffer.value = "";
        const requiredCheckbox = getElement("#requiredCheckbox"); requiredCheckbox.checked = false;

        // reset state to its default
        this.setState({
            labelValue: '',
            typeValue: 'Multi-Select',
            required: false,
            defaultValue: '',
            bufferedChoice: '',
            choicesString: '',
            choices: [],
            order: 'Display Choices in Alphabetical Order'
        });
    }

    /**
     * Would handle cancellation of form editing and return us to the main application. As of now, posts an alert.
     */
    handleCancel = (e) => {
        alert("This is where we'd return to the app, if we had one!");
    }

    /**
     *  Renders the choices the builder is compiling for the field in the textarea below the input textarea. Used as
     *  a helper method when the textarea must change upon a choice being added, removed, or form submission when a
     *  default value may have been added.
     *
     * @param choicesToRender the array of choices we want to represent as a string in the textarea on the form
     * @returns {string} the string representation of the choices the user has committed to the field
     */
    renderChoiceTextarea(choicesToRender) {
        // update existing value of visual textarea without the deleted choice
        let newValue = "";
        for (const item of choicesToRender) {
            newValue = newValue.concat(item).concat("\n");
        }
        return newValue;
    }

    /**
     * Renders the form, composed of many subcomponents.
     *
     * @returns {JSX.Element} FieldBuilderForm
     */
    render() {
        return(
            <Container className={"pt-2"}>

                {/* Field Builder Form Header */}
                <Row>
                    <Col className={"fs-4 bg-info bg-opacity-25 text-muted text-bold rounded-top"}>Field Builder</Col>
                </Row>

                {/* Outer Row holds all form content */}
                <Row className={"ps-3 pe-3 border border-2 border-top-0 rounded-bottom"}>
                    {/* Form Content Column */}
                    <Col>
                        {/* Rendering each component of the form */}
                        <Form>
                            {this.renderLabelField()}
                            {this.renderTypeField()}
                            {this.renderDefaultValueField()}
                            {this.renderChoicesField()}
                            {this.renderOrderField()}
                            {this.renderSave()}
                            {this.renderCancel()}
                            {this.renderClear()}
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }

    // Render methods for each subcomponent
    renderLabelField() {
        return (<LabelField
            onChange={this.handleInputBuffering}
        />
    );}

    renderTypeField() {
        return (<TypeField
                type={this.state.typeValue}
                onChange={this.handleInputBuffering}
        />
        );
    }

    renderDefaultValueField() {
        return (<DefaultValueField
                onChange={this.handleInputBuffering}
        />
        );
    }

    /**
     * Renders the ChoicesField composite component.
     *
     * @returns {JSX.Element} the ChoicesField composite component
     */
    renderChoicesField() {
        return (<ChoicesField
                choicesString={this.state.choicesString}
                onChange={this.handleInputBuffering}
                onAdd={this.handleChoiceAddition}
                onRemove={this.handleChoiceRemoval}
        />
        );
    }

    /**
     * Renders the OrderField composite component.
     *
     * @returns {JSX.Element} the OrderField composite component
     */
    renderOrderField() {return <OrderField />}

    /**
     * Renders the Buttons at the bottom of the builder form.
     *
     */
    renderCancel() {
        return (<CancelButton
                onClick={this.handleCancel}
            />
        );
    }
    renderClear() {
        return (<ClearButton
                onClick={this.handleClear}
            />
        );
    }
    renderSave() {
        return (<SaveButton
                onClick={this.handleSubmit}
            />
        );
    }
}

/**
 * Renders the FieldLabel component wherein the builder specifies the label for the field they are building.
 */
class LabelField extends React.Component {
    render() {
        /* Sourced this general form structure from:
        https://react-bootstrap.github.io/forms/layout/#horizontal-form */
        return (
            <Form.Group as={Row} className={"mt-3"}>
                <FormLabel label={"Label"}/>
                <Col sm={6}>
                    <Form.Control className={"mt-1 LabelField"}
                                  placeholder="ex. 'Sales Region'"
                                  id={"labelInputBuffer"}
                                  name={"labelValue"}
                                  onChange={this.props.onChange}/>
                </Col>
            </Form.Group>
        );
    }
}

/**
 * Renders the component in which the user may specify whether the tyep
 */
class TypeField extends React.Component {
    render() {
        /* Assistance from: https://react-bootstrap.github.io/components/dropdowns/ */
        return(
            <Form.Group as={Row} className={"mt-3"}>

                {/* Field on the left of the form*/}
                <FormLabel label={"Field Type"}/>

                {/* Multi-Select Button and the value checkbox live in the same row*/}
                <Col sm={6}>
                    <Row>
                        {/* Dropdown */}
                        <Col style={{display: 'flex', alignItems: 'start', justifyContent: 'start'}}>
                            <DropdownButton className={"mt-1 fb-size-long"}
                                            name={"typeValue"}
                                            variant={"success"}
                                            title={this.props.type}
                                            drop={"start"}>
                                <Dropdown.Item>Multi-Select</Dropdown.Item>
                            </DropdownButton>
                        </Col>

                        {/* Checkbox */}
                        <Col style={{display: 'flex', alignItems: 'start', justifyContent: 'start'}}>
                            <FormCheck className={"mt-1"}
                                       name={"required"}
                                       id={"requiredCheckbox"}
                                       onClick={this.props.onChange}
                                       label={"This field requires input"}/>
                        </Col>
                    </Row>
                </Col>
            </Form.Group>
        );
    }
}

/**
 * Renders the component in which the builder specifies a default value for the field they are building.
 */
class DefaultValueField extends React.Component {
    render() {
        /* Sourced this general form structure from: https://react-bootstrap.github.io/forms/layout/#horizontal-form */
        return (
            <Form.Group as={Row} className={"mt-3"}>
                <FormLabel label={"Field Default Value"}/>
                <Col sm={6}>
                    <Form.Control className={"mt-1"}
                                  name={"defaultValue"}
                                  id={"defaultInputBuffer"}
                                  type="Label"
                                  placeholder="ex. 'Asia'"
                                  onChange={this.props.onChange}
                    />
                </Col>
            </Form.Group>
        );
    }
}

/**
 * Renders the component in which the builder adds choices for the field they are building.
 */
class ChoicesField extends React.Component {
    render() {
        return(
            <Form.Group as={Row} className={"mt-3"}>
                <Col sm={4}>
                    <Form.Label className={"fs-5 pt-2"}>
                        Field Choices
                    </Form.Label>
                </Col>
                <Col sm={6}>
                    {/* Form control accepts input from the user */}
                    <Form.Control as={"textarea"}
                                  id={"choiceInputBuffer"}
                                  name={"bufferedChoice"}
                                  rows={"1"}
                                  className={"mt-1 fb-no-user-resize"}
                                  type="text"
                                  placeholder="ex. 'Asia'"
                                  // function passed to the child component is called in parent
                                  onChange={this.props.onChange}
                                  />

                    {/* Form control accepts input from the user ONLY through the use of the textarea above */}
                    <Form.Control as={"textarea"}
                                  rows={"6"}
                                  className={"mt-1 fb-no-user-resize"}
                                  type="text"
                                  placeholder={"Added choices will display here!"}
                                  readOnly={true}
                                  value={this.props.choicesString}
                    />
                </Col>
                <Col className={"pt-2"}>
                    {/* Button adds buffered input to the choices textarea */}
                    <Button variant={"success"}
                            onClick={this.props.onAdd}
                            type={"button"}
                            size={"sm"}>
                        Add Choice
                    </Button>
                    {/* Button removes most recent input from the choices textarea */}
                    <Button variant={"danger"}
                            className={"mt-2"}
                            onClick={this.props.onRemove}
                            type={"button"}
                            size={"sm"}>
                        Remove Choice
                    </Button>
                </Col>
            </Form.Group>
        );
    }
}

/**
 * Renders the component in which the builder specifies the order in which their field's choices will display for the
 * field they are building.
 */
class OrderField extends React.Component {
    render() {
        return(
            <Form.Group as={Row} className={"mt-3"}>
                <FormLabel label={"Order of Choices"}/>
                <Col sm={6}>
                    <Form.Select className={"mt-1"}
                                 type="Label">
                        <option>Display Choices in Alphabetical Order</option>
                    </Form.Select>
                </Col>
            </Form.Group>
        );
    }
}

/**
 * Renders the component in which the builder can save the changes they have made to the field they are building.
 */
class SaveButton extends React.Component {
    render() {
        return(
            <Row className={"mt-3 pb-2"}>
                {/* Empty label keeps consistent spacing */}
                <FormLabel label={""}/>
                <Col sm={6}>
                    <Button variant={"success"}
                            className={"fb-size-100"}
                            onClick={this.props.onClick}
                    > Save Changes </Button>
                </Col>
            </Row>
        );
    }
}

/**
 * Renders the button in which the builder may clear the information for the field they are building and start over
 * from scratch.
 */
class ClearButton extends React.Component {
    render() {
        return(
            <Row className={"pb-5"}>
                {/* Empty label keeps consistent spacing */}
                <FormLabel label={""}/>
                <Col sm={6}>
                    <Button variant={"outline-danger"}
                            className={"fb-size-100"}
                            onClick={this.props.onClick}>
                        Clear Form </Button>
                </Col>
            </Row>
        );
    }
}

/**
 * Renders the button in which the builder may cancel editing of the field and navigate away from the page.
 */
class CancelButton extends React.Component {
    render() {
        return(
            <Row className={"pb-2"}>
                {/* Empty label keeps consistent spacing */}
                <FormLabel label={""}/>
                <Col sm={6}>
                    <Button variant={"outline-danger"}
                            className={"fb-size-100"}
                            onClick={this.props.onClick}>
                        Cancel </Button>
                </Col>
            </Row>
        );
    }
}

/**
 * Renders the button
 */
class FormLabel extends React.Component {
    render() {
        return(
            <Col sm={4}>
                <Form.Label className={"fs-5 pt-2"}>
                    {this.props.label}
                </Form.Label>
            </Col>
        )
    }
}

//  the below from the React Website
// ========================================
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<FieldBuilderForm />);
