import { IProduct, IPropertySet, IProperty, IQuantitySet, IQuantity} from '../bimsync-project/bimsync-project.models';

export interface IHighlightedElements {
    ids: number[];
    color: string;
}

export class DisplayProperty {
    readonly name: string;
    readonly type: string;
    enable: boolean;
    readonly icon: string;
    readonly availableGroupingModes: GroupingMode[];
    readonly path: string[];
    readonly unit: string;
    readonly guid: string;
    columnGuid: string;
    isFirst: boolean;
    isLast: boolean;
    propertyValue: any;

    private _groupingMode: GroupingMode;

    constructor(name: string, type: string, unit: string, path: string[], product: IProduct) {
        this.name = name;
        this.type = type;
        this.unit = unit;
        this.enable = false;
        this.icon = this.GetIcon();
        this.path = path;
        this._groupingMode = new GroupingMode();
        this.availableGroupingModes = this.GetAvailableGroupingModes();
        this.guid = Guid.newGuid();
        this.columnGuid = Guid.newGuid();
        this.propertyValue = Products.GetPropertyValueFromPath(path, product);
    }

    get groupingMode(): GroupingMode {
        return this._groupingMode;
    }

    get displayedValue(): string {
        let value = this.propertyValue;
        if (value == null) {
            return 'null';
        }
        if (typeof this.propertyValue === 'number') {
            value = Math.round(this.propertyValue * 100) / 100;
        }
        if (this.unit) {
            value = value + ' ' + this.unit;
        }
        return value.toString();
    }

    get displayName(): string {
        const displayUnit = this.unit ? ' (' + this.unit + ')' : '';
        return this._groupingMode.modeText + this.name + displayUnit;
    }

    set groupingMode(groupingMode: GroupingMode) {
        this._groupingMode = groupingMode;
        this.SetGroupingMode(groupingMode);
    }

    private GetIcon(): string {
        return this.type === 'number' ? 'slider' : 'text';
    }

    private GetAvailableGroupingModes(): GroupingMode[] {
        let modes = [
            new GroupingMode(GroupingModeEnum.DontSummarize),
            new GroupingMode(GroupingModeEnum.Count),
            new GroupingMode(GroupingModeEnum.CountDistinct),
            new GroupingMode(GroupingModeEnum.First),
            new GroupingMode(GroupingModeEnum.Last),
        ]

        let numberModes = [
            new GroupingMode(GroupingModeEnum.DontSummarize),
            new GroupingMode(GroupingModeEnum.Sum),
            new GroupingMode(GroupingModeEnum.Average),
            new GroupingMode(GroupingModeEnum.Minimun),
            new GroupingMode(GroupingModeEnum.Maximun),
            new GroupingMode(GroupingModeEnum.CountDistinct),
            new GroupingMode(GroupingModeEnum.Count),
            new GroupingMode(GroupingModeEnum.StandardDeviation),
            new GroupingMode(GroupingModeEnum.Variance),
            new GroupingMode(GroupingModeEnum.Median)
        ]

        if (this.type === 'number') {
            modes = numberModes;
        }

        modes[0].isEnabled = true;
        return modes;
    }

    private SetGroupingMode(groupingMode: GroupingMode) {
        let index = this.availableGroupingModes.indexOf(groupingMode, 0);
        if (index > -1) {
            this.availableGroupingModes.forEach(gM => { gM.isEnabled = false; });
            this.availableGroupingModes[index].isEnabled = true;
        }
    }
}

export interface IDisplayPropertySet {
    name: string;
    properties: DisplayProperty[];
}

export enum GroupingModeEnum {
    DontSummarize,
    Count,
    CountDistinct,
    First,
    Last,
    Sum,
    Average,
    Minimun,
    Maximun,
    StandardDeviation,
    Variance,
    Median
}

export enum SortEnum {
    Up,
    Down,
    ToTop,
    ToBottom
}

export class GroupingMode {

    isEnabled: boolean;
    mode: GroupingModeEnum;

    private _modeName: string;

    constructor(groupingModeEnum?: GroupingModeEnum) {
        this.mode = groupingModeEnum || GroupingModeEnum.DontSummarize;
        this.isEnabled = false;
    }

    get modeName(): string {
        return this.GetGroupingModeDisplay();
    }

    get modeText(): string {
        return this.GetGroupingModeText();
    }

    private GetGroupingModeDisplay(): string {
        switch (this.mode) {
            case GroupingModeEnum.DontSummarize: {
                return "Don't Summarize";
            }
            case GroupingModeEnum.Count: {
                return "Count";
            }
            case GroupingModeEnum.CountDistinct: {
                return "Count (Distinct)";
            }
            case GroupingModeEnum.First: {
                return "First";
            }
            case GroupingModeEnum.Last: {
                return "Last";
            }
            case GroupingModeEnum.Sum: {
                return "Sum";
            }
            case GroupingModeEnum.Average: {
                return "Average";
            }
            case GroupingModeEnum.Minimun: {
                return "Minimun";
            }
            case GroupingModeEnum.Maximun: {
                return "Maximun";
            }
            case GroupingModeEnum.StandardDeviation: {
                return "Standard Deviation";
            }
            case GroupingModeEnum.Variance: {
                return "Variance";
            }
            case GroupingModeEnum.Median: {
                return "Median";
            }
            default: {
                return "Don't Summarize";
            }
        }
    }

    private GetGroupingModeText(): string {
        switch (this.mode) {
            case GroupingModeEnum.DontSummarize: {
                return "";
            }
            case GroupingModeEnum.Count: {
                return "Count of ";
            }
            case GroupingModeEnum.CountDistinct: {
                return "Count of ";
            }
            case GroupingModeEnum.First: {
                return "First ";
            }
            case GroupingModeEnum.Last: {
                return "Last ";
            }
            case GroupingModeEnum.Sum: {
                return "Sum of ";
            }
            case GroupingModeEnum.Average: {
                return "Average of ";
            }
            case GroupingModeEnum.Minimun: {
                return "Min of ";
            }
            case GroupingModeEnum.Maximun: {
                return "Max of ";
            }
            case GroupingModeEnum.StandardDeviation: {
                return "Standard deviation of ";
            }
            case GroupingModeEnum.Variance: {
                return "Variance of ";
            }
            case GroupingModeEnum.Median: {
                return "Median of ";
            }
            default: {
                return "";
            }
        }
    }
}

export class Guid {
    static newGuid() {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
}

export class ValueTree {
    readonly value: any;
    readonly property: DisplayProperty;
    readonly selectedProperties: DisplayProperty[];
    readonly products: IProduct[];
    readonly columnNumber: number;
    readonly tree: ValueTree[];

    constructor(value: any, columnNumber: number, selectedProperties: DisplayProperty[], products: IProduct[]) {
        this.value = value;
        this.property = selectedProperties[columnNumber];
        this.columnNumber = columnNumber;
        this.selectedProperties = selectedProperties;
        this.products = products;
        this.tree = this.GetValueTree();
    }

    private GetValueTree(): ValueTree[] {

        let nextColumntreeItems: ValueTree[] = [];

        if (this.columnNumber + 1 < this.selectedProperties.length) {
            // Get the array of values for the next column
            let nextColumnArray: any[] = Products.GetGroupedList(
                this.selectedProperties[this.columnNumber + 1],
                this.products
            );

            // Create a tree item for each value of the next column
            nextColumnArray.forEach(value => {
                let filteredProducts = this.products;

                // if we don't summarize the products, we keep all of them
                if (this.selectedProperties[this.columnNumber + 1].groupingMode.mode === GroupingModeEnum.DontSummarize) {
                    filteredProducts = Products.GetFilteredProducts(
                        this.products,
                        this.selectedProperties[this.columnNumber + 1].path,
                        value
                    );
                }


                nextColumntreeItems.push(new ValueTree(
                    value,
                    this.columnNumber + 1,
                    this.selectedProperties,
                    filteredProducts
                ));
            });
        }

        return nextColumntreeItems;
    }

    get rows(): any {
        let rows: any[] = [];

        if (this.tree.length !== 0) {
            this.tree.forEach(treeItem => {
                treeItem.rows.forEach(row => {
                    row[this.property.columnGuid] = this.value;
                    rows.push(row);
                });
            });
        } else {
            let row: any = {};
            row[this.property.columnGuid] = this.value;
            rows.push(row);
        }

        return rows;
    }
}

export class Products {

    private static round(num: any): number {
        return Math.round(num * 100) / 100;
    }

    static GetGroupedList(selectedProperty: DisplayProperty, products: IProduct[]): any[] {

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        function average(data) {
            const sum = data.reduce((a, b) => a + b, 0);
            return sum / data.length;
        }

        function variance(array) {
            const avg = average(array);
            const squareDiffs = array.map((value) => (value - avg) * (value - avg));
            return average(squareDiffs);
        }

        let allPropertyValuesList = products.map(product => {
            return this.GetPropertyValueFromPath(selectedProperty.path, product);
        });

        switch (selectedProperty.groupingMode.mode) {
            case GroupingModeEnum.DontSummarize: {
                return allPropertyValuesList.filter(onlyUnique);
            }
            case GroupingModeEnum.Count: {
                return [allPropertyValuesList.length];
            }
            case GroupingModeEnum.CountDistinct: {
                return [allPropertyValuesList.filter(onlyUnique).length];
            }
            case GroupingModeEnum.First: {
                return [allPropertyValuesList.filter(onlyUnique).sort()[0]];
            }
            case GroupingModeEnum.Last: {
                let filteredValues = allPropertyValuesList.filter(onlyUnique).sort();
                return [filteredValues[filteredValues.length - 1]];
            }
            case GroupingModeEnum.Sum: {
                return [this.round(allPropertyValuesList.reduce((a, b) => a + b, 0))];
            }
            case GroupingModeEnum.Average: {
                return [this.round(average(allPropertyValuesList))];
            }
            case GroupingModeEnum.Minimun: {
                return [allPropertyValuesList.filter(onlyUnique).sort()[0]];
            }
            case GroupingModeEnum.Maximun: {
                let filteredValues = allPropertyValuesList.filter(onlyUnique).sort();
                return [filteredValues[filteredValues.length - 1]];
            }
            case GroupingModeEnum.StandardDeviation: {
                return [this.round(Math.sqrt(variance(allPropertyValuesList)))];
            }
            case GroupingModeEnum.Variance: {
                return [this.round(variance(allPropertyValuesList))];
            }
            case GroupingModeEnum.Median: {
                const arr = allPropertyValuesList.sort((a, b) => a - b);
                let median = 0;
                if (arr.length % 2 === 1) {
                    median = arr[(arr.length + 1) / 2 - 1];
                } else {
                    median = (1 * arr[arr.length / 2 - 1] + 1 * arr[arr.length / 2]) / 2;
                }
                return [this.round(median)]
            }
            default: {
                return allPropertyValuesList.filter(onlyUnique);
            }
        }
    }

    static GetFilteredProducts(products: IProduct[], path: string[], value: any): IProduct[] {
        return products.filter(product =>
            this.GetPropertyValueFromPath(path, product) === value
        );
    }

    static GetPropertyValueFromPath(path: string[], object: any): any {
        return path.reduce((acc, currValue) => {
            if (acc && acc[currValue] !== null) {
                return acc[currValue];
            } else {
                return null;
            }
        }
            , object)
    }

    static GetProductProperties(product: IProduct): IDisplayPropertySet[] {

        let displayedPropertySets: IDisplayPropertySet[] = [];

        let displayedPropertyMainSet: IDisplayPropertySet = { name: 'Identification', properties: [] }

        let objectNameProperty: DisplayProperty = new DisplayProperty('Name', 'string', "", ['attributes', 'Name', 'value'], product);

        if (Products.GetPropertyValueFromPath(['attributes', 'Name', 'value'], product)) {
            displayedPropertyMainSet.properties.push(objectNameProperty);
        }

        let objectTypeProperty: DisplayProperty = new DisplayProperty('Type', 'string', "", ['attributes', 'ObjectType', 'value'], product);

        if (Products.GetPropertyValueFromPath(['attributes', 'ObjectType', 'value'], product)) {
            displayedPropertyMainSet.properties.push(objectTypeProperty);
        }

        let globalIdProperty: DisplayProperty = new DisplayProperty('GUID', 'string', "", ['attributes', 'GlobalId', 'value'], product);

        if (Products.GetPropertyValueFromPath(['attributes', 'GlobalId', 'value'], product)) {
            displayedPropertyMainSet.properties.push(globalIdProperty);
        }

        let tagProperty: DisplayProperty = new DisplayProperty('Tag', 'string', "", ['attributes', 'Tag', 'value'], product);

        if (Products.GetPropertyValueFromPath(['attributes', 'Tag', 'value'], product)) {
            displayedPropertyMainSet.properties.push(tagProperty);
        }

        let objectClassProperty: DisplayProperty = new DisplayProperty('Entity', 'string', "", ['ifcType'], product);

        if (product.ifcType) { displayedPropertyMainSet.properties.push(objectClassProperty); }

        displayedPropertySets.push(displayedPropertyMainSet);

        Object.keys(product.propertySets).forEach(propertySetKey => {
            let propertySet = product.propertySets[propertySetKey] as IPropertySet;
            let displayedPropertySet: IDisplayPropertySet = { name: propertySet.attributes.Name.value, properties: [] }
            Object.keys(propertySet.properties).forEach(propertyKey => {
                let property: IProperty = propertySet.properties[propertyKey] as IProperty;
                let displayProperty: DisplayProperty = new DisplayProperty(
                    propertyKey,
                    property.nominalValue ? property.nominalValue.type : 'string',
                    property.nominalValue ? property.nominalValue.unit : 'string',
                    ['propertySets', propertySetKey, 'properties', propertyKey, 'nominalValue', 'value'],
                    product
                );
                displayedPropertySet.properties.push(displayProperty);
            });
            displayedPropertySets.push(displayedPropertySet);
        });


        Object.keys(product.quantitySets).forEach(quantitySetKey => {
            let quantitySet = product.quantitySets[quantitySetKey] as IQuantitySet;
            let displayedQuantitySet: IDisplayPropertySet = { name: quantitySet.attributes.Name.value, properties: [] }
            Object.keys(quantitySet.quantities).forEach(quantityKey => {
                let quantity: IQuantity = quantitySet.quantities[quantityKey] as IQuantity;
                let icon = quantity.value.type === 'string' ? 'text' : 'slider';
                let displayProperty: DisplayProperty = new DisplayProperty(
                    quantityKey,
                    quantity.value.type,
                    quantity.value.unit,
                    ['quantitySets', quantitySetKey, 'quantities', quantityKey, 'value', 'value'],
                    product
                );
                displayedQuantitySet.properties.push(displayProperty);
            });
            displayedPropertySets.push(displayedQuantitySet);
        });

        return displayedPropertySets;
    }
}


