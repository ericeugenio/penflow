import React, { useState } from "react";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { type Option, Select } from "@/components/ui/form/select";
import { Textarea } from "@/components/ui/form/textarea";
import { Modal } from "@/components/ui/modal";
import { usePenflowStore } from "@/hooks/store-provider";
import type { PenflowStore } from "@/stores/store";
import type { ValidationError } from "@/tmp/semantic-validation-errors";
import * as validations from "@/tmp/semantic-validation-errors";
import type { NamedFlowVariable } from "@/types/FlowVariable";

const primitiveVariableTypeOptions: Option[] = [
    {
        text: "string",
        value: "string"
    },
    {
        text: "number",
        value: "number"
    },
    {
        text: "boolean",
        value: "boolean"
    }
]
const variableTypeOptions: Option[] = [
    ...primitiveVariableTypeOptions,
    {
        text: "array",
        value: "array"
    },
    {
        text: "object",
        value: "object",
        disabled: true
    }
]
const variableScopeOptions: Option[] = [
    {
        text: "in",
        value: "in"
    },
    {
        text: "out",
        value: "out",
        disabled: true
    }
]

const modalSelector = (state: PenflowStore) => ({
    variable: state.getCurrentVariable(),
    isOpen: state.isVariablesFormOpen,
    handleClose: () => state.setIsVariablesFormOpen(false),
});

export default function VariableFormModal() {
    const { variable, isOpen, handleClose } = usePenflowStore(useShallow(modalSelector));

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            {variable && <VariablesForm variable={variable} onClose={handleClose} />}
        </Modal>
    );
}

const formSelector = (state: PenflowStore) => ({
    variables: state.flow!.variables,
    saveVariable: state.saveVariable
});

type VariablesFormProps = {
    variable: NamedFlowVariable,
    onClose: () => void,
};

function VariablesForm({ variable, onClose }: VariablesFormProps) {
    const { variables, saveVariable } = usePenflowStore(useShallow(formSelector));
    const [tmpVariable, setTmpVariable] = useState<NamedFlowVariable>(variable);
    const [errors, setErrors] = useState<{[field: string]: ValidationError[]}>({});

    const handleSave = () => {
        const _errors: {[k: string]: ValidationError[]} = {};
        if (tmpVariable.name === "") {
            _errors["name"] = [validations.ERR_REQUIRED_FIELD(variable.name, "name")];
        }
        if (tmpVariable.displayName === "") {
            _errors["displayName"] = [validations.ERR_REQUIRED_FIELD(variable.name, "displayName")];
        }

        if (Object.keys(_errors).length == 0) {
            saveVariable(variable.name, tmpVariable);
            onClose();
        } else {
            setErrors({
                ...errors,
                ..._errors
            });
        }
    };

    const handleCancel = () => {
        onClose();
    }

    const handleFieldChange = (field: string, isRequired: boolean, change: any) => {
        let _errors: ValidationError[] = [];
        // Validate required properties
        if (isRequired && change == "") {
            _errors.push(validations.ERR_REQUIRED_FIELD(variable.name, field));
        }
        // Validate duplicate name and reserved keyword "new"
        if (field === "name") {
            if (change.toLowerCase() != variable.name.toLowerCase() && change.toLowerCase() in variables) {
                _errors.push(validations.ERR_REDECLARED_VARIABLE(variable.name, change));
            }
            if (change.toLowerCase() === "new") {
                _errors.push(validations.ERR_RESERVED_KEYWORD(variable.name, "new"));
            }
        }
        // Set value
        if (field === "type") {
            if (change === "array") {
                setTmpVariable({
                    ...tmpVariable,
                    type: change,
                    items: {
                        type: "string"
                    }
                });
            } else if (change === "object") {

            } else {
                const {items, ...remainingAttributes} = tmpVariable;
                setTmpVariable({
                    ...remainingAttributes,
                    type: change
                });
            }
        } else if (field === "itemsType") {
            setTmpVariable({
                ...tmpVariable,
                items: {
                    type: change
                }
            });
        } else {
            setTmpVariable({
                ...tmpVariable,
                [field]: change
            });
        }
        // Set errors
        setErrors({
            ...errors,
            [field]: [..._errors]
        });
    };

    return(
        <div className="flex flex-col max-h-full mx-auto divide-y divide-slate-200 rounded-xl bg-white">
            <div className="flex-shrink-0 px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900 leading-6">Variable editor</h3>
                    <IconButton
                        Icon={XMarkIcon}
                        onClick={handleCancel}
                        className="h-7 flex items-center"
                    />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto px-4 py-4 sm:p-6">
                <div className="space-y-4">
                    <Input
                        name="name"
                        type="text"
                        value={tmpVariable.name}
                        onChange={(newValue) => handleFieldChange(
                            "name",
                            true,
                            newValue
                        )}
                        displayName="Variable name"
                        description="The name of the variable to be used within the editor."
                        errors={errors["name"]?.map((err) => err.message)}
                        isRequired={true}
                    />
                    <div className="flex gap-x-4">
                        <Select
                            name="type"
                            value={variableTypeOptions.find((option) => option.value === tmpVariable.type)}
                            options={variableTypeOptions}
                            onChange={(newValue) => handleFieldChange(
                                "type",
                                true,
                                newValue.value
                            )}
                            displayName="Data type"
                            description="The data type of the variable."
                            isRequired={true}
                            empty={false}
                            className="flex-1"
                        />
                        {tmpVariable.type === "array" && (
                            <Select
                                name="itemsType"
                                value={primitiveVariableTypeOptions.find((option) => option.value === tmpVariable.items!.type)}
                                options={primitiveVariableTypeOptions}
                                onChange={(newValue) => handleFieldChange(
                                    "itemsType",
                                    true,
                                    newValue.value
                                )}
                                displayName="Items"
                                isRequired={true}
                                empty={false}
                                className="min-w-[25%]"
                            />
                        )}
                    </div>
                    <Select
                        name="scope"
                        value={variableScopeOptions.find((option) => option.value === tmpVariable.scope)}
                        options={variableScopeOptions}
                        onChange={ (newValue) => handleFieldChange(
                            "scope",
                            true,
                            newValue.value
                        )}
                        displayName="Scope"
                        description="The scope of the variable."
                        isRequired={true}
                        empty={false}
                    />
                    <Input
                        name="displayName"
                        type="text"
                        value={tmpVariable.displayName || ""}
                        onChange={(newValue) => handleFieldChange(
                            "displayName",
                            true,
                            newValue
                        )}
                        displayName="Display name"
                        description="The name of the variable to be used outside the editor."
                        errors={errors["displayName"]?.map((err) => err.message)}
                        isRequired={true}
                    />
                    <Textarea
                        name="description"
                        rows={4}
                        value={tmpVariable.description || ""}
                        onChange={(newValue) => handleFieldChange(
                            "description",
                            false,
                            newValue
                        )}
                        displayName="Description"
                        description="A brief description of the variable purpose."
                        maxCharacters={255}
                        minHeight="min-h-[100px]"
                        maxHeight="max-h-[150px]"
                    />
                </div>
            </div>
            <div className="flex-shrink-0 px-4 py-4 sm:px-6">
                <div className="flex justify-end gap-x-4">
                    <Button type="button" role="secondary" onClick={handleCancel}>Cancel</Button>
                    <Button
                        type="button"
                        role="primary"
                        onClick={handleSave}
                        disabled={Object.values(errors).some((errorList) => errorList.length > 0)}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
}