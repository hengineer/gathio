import moment from "moment-timezone";

type Error = {
    message?: string;
    field?: string;
};

type ValidationResponse = {
    data?: ValidatedEventData;
    errors?: Error[];
};

interface EventData {
    eventName: string;
    eventLocation: string;
    eventStart: string;
    eventEnd: string;
    timezone: string;
    eventDescription: string;
    eventURL: string;
    imagePath: string;
    hostName: string;
    creatorEmail: string;
    eventGroupCheckbox: string;
    eventGroupID: string;
    eventGroupEditToken: string;
    interactionCheckbox: string;
    joinCheckbox: string;
    maxAttendeesCheckbox: string;
    maxAttendees: number;
}

// EventData without the 'checkbox' fields
export type ValidatedEventData = Omit<
    EventData,
    | "eventGroupCheckbox"
    | "interactionCheckbox"
    | "joinCheckbox"
    | "maxAttendeesCheckbox"
> & {
    eventGroupBoolean: boolean;
    interactionBoolean: boolean;
    joinBoolean: boolean;
    maxAttendeesBoolean: boolean;
};

interface EventGroupData {
    eventGroupName: string;
    eventGroupDescription: string;
    eventGroupURL: string;
    hostName: string;
    creatorEmail: string;
}

const validateEmail = (email: string) => {
    if (!email || email.length === 0 || typeof email !== "string") {
        return false;
    }
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validateEventTime = (start: Date, end: Date): Error | boolean => {
    if (moment(start).isAfter(moment(end))) {
        return {
            message: "Start time must be before end time.",
            field: "eventStart",
        };
    }
    if (moment(start).isBefore(moment())) {
        return {
            message: "Start time must be in the future.",
            field: "eventStart",
        };
    }
    if (moment(end).isBefore(moment())) {
        return {
            message: "End time must be in the future.",
            field: "eventEnd",
        };
    }
    // Duration cannot be longer than 1 year
    if (moment(end).diff(moment(start), "years") > 1) {
        return {
            message: "Event duration cannot be longer than 1 year.",
            field: "eventEnd",
        };
    }
    return true;
};

export const validateEventData = (eventData: EventData): ValidationResponse => {
    const validatedData: ValidatedEventData = {
        ...eventData,
        eventGroupBoolean: eventData.eventGroupCheckbox === "true",
        interactionBoolean: eventData.interactionCheckbox === "true",
        joinBoolean: eventData.joinCheckbox === "true",
        maxAttendeesBoolean: eventData.maxAttendeesCheckbox === "true",
    };
    const errors: Error[] = [];
    if (!validatedData.eventName) {
        errors.push({
            message: "Event name is required.",
            field: "eventName",
        });
    }
    if (!validatedData.eventLocation) {
        errors.push({
            message: "Event location is required.",
            field: "eventLocation",
        });
    }
    if (!validatedData.eventStart) {
        errors.push({
            message: "Event start time is required.",
            field: "eventStart",
        });
    }
    if (!validatedData.eventEnd) {
        errors.push({
            message: "Event end time is required.",
            field: "eventEnd",
        });
    }
    const timeValidation = validateEventTime(
        new Date(validatedData.eventStart),
        new Date(validatedData.eventEnd),
    );
    if (timeValidation !== true && timeValidation !== false) {
        errors.push({
            message: timeValidation.message,
        });
    }
    if (!validatedData.timezone) {
        errors.push({
            message: "Event timezone is required.",
            field: "timezone",
        });
    }
    if (!validatedData.eventDescription) {
        errors.push({
            message: "Event description is required.",
            field: "eventDescription",
        });
    }
    if (validatedData.eventGroupBoolean) {
        if (!validatedData.eventGroupID) {
            errors.push({
                message: "Event group ID is required.",
                field: "eventGroupID",
            });
        }
        if (!validatedData.eventGroupEditToken) {
            errors.push({
                message: "Event group edit token is required.",
                field: "eventGroupEditToken",
            });
        }
    }
    if (validatedData.maxAttendeesBoolean) {
        if (!validatedData.maxAttendees) {
            errors.push({
                message: "Max number of attendees is required.",
                field: "maxAttendees",
            });
        }
        if (isNaN(validatedData.maxAttendees)) {
            errors.push({
                message: "Max number of attendees must be a number.",
                field: "maxAttendees",
            });
        }
    }
    if (validatedData.creatorEmail) {
        if (!validateEmail(validatedData.creatorEmail)) {
            errors.push({
                message: "Email address is invalid.",
                field: "creatorEmail",
            });
        }
    }

    return {
        data: validatedData,
        errors: errors,
    };
};

export const validateGroupData = (groupData: EventGroupData) => {
    const errors: Error[] = [];
    if (!groupData.eventGroupName) {
        errors.push({
            message: "Event group name is required.",
            field: "eventGroupName",
        });
    }
    if (!groupData.eventGroupDescription) {
        errors.push({
            message: "Event group description is required.",
            field: "eventGroupDescription",
        });
    }
    if (groupData.creatorEmail) {
        if (!validateEmail(groupData.creatorEmail)) {
            errors.push({
                message: "Email address is invalid.",
                field: "creatorEmail",
            });
        }
    }

    return {
        data: groupData,
        errors: errors,
    };
};
