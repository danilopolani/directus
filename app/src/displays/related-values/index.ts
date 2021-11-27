import { defineDisplay } from '@directus/shared/utils';
import adjustFieldsForDisplays from '@/utils/adjust-fields-for-displays';
import { getFieldsFromTemplate } from '@directus/shared/utils';
import getRelatedCollection from '@/utils/get-related-collection';
import DisplayRelatedValues from './related-values.vue';
import { useFieldsStore } from '@/stores';

type Options = {
	template: string;
};

export default defineDisplay({
	id: 'related-values',
	name: '$t:displays.related-values.related-values',
	description: '$t:displays.related-values.description',
	icon: 'settings_ethernet',
	component: DisplayRelatedValues,
	options: ({ relations }) => {
		const relatedCollection = relations.o2m?.collection ?? relations.m2o?.related_collection;
		const canDisplayInline = relations.o2m !== undefined || relations.m2m !== undefined;

		const fields = [
			{
				field: 'template',
				name: '$t:display_template',
				meta: {
					interface: 'system-display-template',
					options: {
						collectionName: relatedCollection,
					},
					width: 'full',
				},
			},
		];

		if (canDisplayInline) {
			fields.push(
				{
					field: 'displayInline',
					name: '$t:displays.related-values.display_inline',
					type: 'boolean',
					meta: {
						width: 'half',
						interface: 'boolean',
						options: {
							label: '$t:displays.related-values.display_inline_label',
						},
					},
					schema: {
						default_value: false,
					},
				},
				{
					field: 'inlineMaxResults',
					name: '$t:displays.related-values.inline_max_results',
					type: 'integer',
					meta: {
						width: 'half',
						interface: 'input',
						hidden: true,
						options: {
							min: 1,
							step: 1,
						},
						conditions: [
							{
								rule: {
									displayInline: {
										_eq: true,
									},
								},
								hidden: false,
							},
						],
					},
					schema: {
						default_value: 3,
					},
				}
			);
		}

		return fields;
	},
	types: ['alias', 'string', 'uuid', 'integer', 'bigInteger', 'json'],
	localTypes: ['m2m', 'm2o', 'o2m', 'translations', 'm2a', 'file', 'files'],
	fields: (options: Options | null, { field, collection }) => {
		const { relatedCollection, path } = getRelatedCollection(collection, field);
		const fieldsStore = useFieldsStore();
		const primaryKeyField = fieldsStore.getPrimaryKeyFieldForCollection(relatedCollection);

		if (!relatedCollection) return [];

		const fields = options?.template
			? adjustFieldsForDisplays(getFieldsFromTemplate(options.template), relatedCollection)
			: [];

		if (primaryKeyField) {
			const primaryKeyFieldValue = path ? [...path, primaryKeyField.field].join('.') : primaryKeyField.field;

			if (!fields.includes(primaryKeyFieldValue)) {
				fields.push(primaryKeyFieldValue);
			}
		}

		return fields;
	},
});
