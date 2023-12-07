'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /* eslint-disable */
    await queryInterface.bulkInsert('roles', [
      { name: 'superadmin' },
      { name: 'admin' },
      { name: 'user' }
    ]),
    /* eslint-enable */
    await queryInterface.bulkInsert('users', [
      { username: 'davidwallace', password: '$2b$12$HoH8vI5x7PRK/juf4mI2NuHh43e8XsOxqGiW9m0Jf2K.MBaUKX77q', email: 'davidwallace@sains.com.my', full_name: 'David Wallace', role_id: 1, is_active: 1, login_type: 'local', last_login: '2023-09-07 14:33:43', created_at: '2023-08-23 16:07:34' },
      { username: 'michaelscott', password: '$2b$12$XJdJ.eoPjkBITzlK6VTqVe990/SRoCKoykcfH5IsvMGK7WeImE0.C', email: 'michaelscott@sains.com.my', full_name: 'Michael Scott', role_id: 2, is_active: 1, login_type: 'local', last_login: '2023-08-23 16:07:57', created_at: '2023-08-23 16:19:43' },
      { username: 'jimhalpert', password: '$2b$12$tTrJ9EnTyf9zLe64vyASa.l21lExrlF7rM.8loiRF7aijud/hkon.', email: 'jimhalpert@sains.com.my', full_name: 'James Duncan Halpert', role_id: 2, is_active: 1, login_type: 'local', last_login: '2023-09-07 14:43:30', created_at: '2023-08-23 16:07:34' },
      { username: 'andybernard', password: '$2b$12$MfFtiEjhjubmcqIxPBqkZuzgRcGbMcTHNKlQfenaoxNErAH.ScPFe', email: 'andybernard@sains.com.my', full_name: 'Andrew Baines Bernard', role_id: 2, is_active: 1, login_type: 'local', last_login: '2023-09-07 14:33:43', created_at: '2023-08-23 16:07:34' },
      { username: 'tobyflenderson', password: '$2b$12$4sABcPzjjlYKPmqriiskr.hNBEZaT5J6Xk7NvB/dolKILIjH4JMXe', email: 'tobyflenderson@sains.com.my', full_name: 'Toby Flenderson', role_id: 2, is_active: 1, login_type: 'local', last_login: '2023-09-07 14:35:30', created_at: '2023-08-23 16:07:34' },
      { username: 'hollyflax', password: '$2b$12$dlQGxd98hqsVdB0e0ZOk/.pRf9nD.4886cB9mnco/wv7NuS5rKDDO', email: 'hollyflax@sains.com.my', full_name: 'Hollis Partridge Scott', role_id: 2, is_active: 1, login_type: 'local', last_login: '2023-09-07 14:33:43', created_at: '2023-08-23 16:07:34' },
      { username: 'karenfilippelli', password: '$2b$12$NhdSJBD3H7x6pZCyzGf8AO8xd6fXwc3KXPPvaF6AekZa3n8iHWsFi', email: 'karenfilippelli@sains.com.my', full_name: 'Karen Filippelli', role_id: 2, is_active: 1, login_type: 'local', last_login: '2023-09-07 12:11:22', created_at: '2023-08-23 16:07:34' },
      { username: 'dwightschrute', password: '$2b$12$kIJ1LnmQP52y79fPf0JKi..fP4qtNNr4R6wmg0ONl03sTAzWgPR62', email: 'dwightschrute@sains.com.my', full_name: 'Dwight Kurt Schrute III', role_id: 3, is_active: 1, login_type: 'local', last_login: '2023-09-07 14:33:43', created_at: '2023-08-23 16:07:34' },
      { username: 'pambeesly', password: '$2b$12$rMJaqbvau7ugPrUjI1AyCOeGi5RVcPjzVlr.NeBLbv2JeMi.2Rpme', email: 'pambeesly@sains.com.my', full_name: 'Pamela Morgan Halpert', role_id: 3, is_active: 1, login_type: 'local', last_login: '2023-09-07 12:11:22', created_at: '2023-08-23 16:07:34' },
      { username: 'janlevinson', password: '$2b$12$AHblok5l.f5tdrQBlfsJaeQo4oAxoabQBUXiED5lou9GlWtRdNqc.', email: 'janlevinson@sains.com.my', full_name: 'Jan Levinson-Gould', role_id: 3, is_active: 1, login_type: 'local', last_login: '2023-08-23 16:07:57', created_at: '2023-08-23 16:07:34' },
      { username: 'bennugent', password: '$2b$12$WBSxtfuxK0eB03OKOOPnCu5ZXzkODwKHESMxythFLfcFwebpgfPee', email: 'bennugent@sains.com.my', full_name: 'Ben Nugent', role_id: 3, is_active: 1, login_type: 'local', last_login: '2023-08-23 16:07:57', created_at: '2023-08-23 16:07:34' },
      { username: 'angelamartin', password: '$2b$12$6SsPqgU1LIK5BKJGPwoW.eVefi/E.hpISXWl2.Cs/WuGNPOgTtLIi', email: 'angelamartin@sains.com.my', full_name: 'Angela Martin', role_id: 3, is_active: 1, login_type: 'local', last_login: '2023-09-07 12:11:22', created_at: '2023-08-23 16:07:34' },
      { username: 'phyllisvance', password: '$2b$12$5ks1OUD6OXi3afP3wF02tuAEAL46nVLjU2oANajv4lVcQEHY/VojO', email: 'phyllisvance@sains.com.my', full_name: 'Phyllis Vance', role_id: 3, is_active: 1, login_type: 'local', last_login: '2023-09-07 14:54:40', created_at: '2023-09-07 14:39:14' },
      { username: 'stanleyhudson', password: '$2b$12$RtzOtl/IIMO06ZpWIB9E.O3IBBMqJLZQZJfNQjjr0ceshi2XqD9BG', email: 'stanleyhudson@sains.com.my', full_name: 'Stanley Hudson', role_id: 3, is_active: 1, login_type: 'local', last_login: '2023-09-07 14:35:30', created_at: '2023-08-23 16:07:34' },
      { username: 'oscarmartinez', password: '$2b$12$8ZSMkszLiSjZaCK/tGcDo.D2tppFSmHBy3fL9ItGDHCuQp177AV.2', email: 'oscarmartinez@sains.com.my', full_name: 'Oscar Martinez', role_id: 3, is_active: 1, login_type: 'local', last_login: '2023-09-07 14:54:40', created_at: '2023-09-07 14:39:14' }
    ]),
    await queryInterface.bulkInsert('notification_types', [
      { name: 'reminder' }, // accounts
      { name: 'announcement' }, // administrative
      { name: 'updates' } // training updates, errors
    ]),
    await queryInterface.bulkInsert('notification_messages', [
      { message: 'You have been added to [project_name].' },
      { message: 'Your password have been updated recently.' },
      { message: 'Your role has been updated to [role_name]' },
      { message: 'A new team member, [username], has joined [project_name]' },
      { message: 'A team member, [username], has been removed from [project_name]' }
    ]),
    await queryInterface.bulkInsert('error_codes', [
      { code: '011001', module: 'authentication', description: 'Required Field Missing', severity: 'LOW' },
      { code: '011102', module: 'authentication', description: 'LDAP Invalid Credentials', severity: 'LOW' },
      { code: '011203', module: 'authentication', description: 'User Not Found', severity: 'WARNING' },
      { code: '011204', module: 'authentication', description: 'User Data Not Found', severity: 'WARNING' },
      { code: '011205', module: 'authentication', description: 'Password Mismatch', severity: 'WARNING' },
      { code: '011206', module: 'authentication', description: 'Password Not Updated', severity: 'MEDIUM' },
      { code: '011007', module: 'authentication', description: 'Internal Server Error', severity: 'HIGH' },
      { code: '021001', module: 'logout', description: 'Session Cannot Be Destroyed', severity: 'HIGH' },
      { code: '021002', module: 'logout', description: 'Internal Server Error', severity: 'HIGH' },
      { code: '031001', module: 'registration', description: 'Unauthorized Access', severity: 'WARNING' },
      { code: '032002', module: 'registration', description: 'Required Field Missing', severity: 'LOW' },
      { code: '032003', module: 'registration', description: 'Record Already Created', severity: 'WARNING' },
      { code: '032004', module: 'registration', description: 'Internal Server Error', severity: 'HIGH' },
      { code: '041001', module: 'change password', description: 'Unauthorized Access', severity: 'WARNING' },
      { code: '042002', module: 'change password', description: 'Required Field Missing', severity: 'LOW' },
      { code: '042003', module: 'change password', description: 'User Data Not Found', severity: 'LOW' },
      { code: '042104', module: 'change password', description: 'Old Password Given Mismatch', severity: 'WARNING' },
      { code: '042105', module: 'change password', description: 'Old & New Password Match', severity: 'WARNING' },
      { code: '042206', module: 'change password', description: 'Password Services Error', severity: 'MEDIUM' },
      { code: '042007', module: 'change password', description: 'Internal Server Error', severity: 'HIGH' },
      { code: '051001', module: 'role update', description: 'Unauthorized Access', severity: 'WARNING' },
      { code: '052002', module: 'role update', description: 'Required Field Missing', severity: 'LOW' },
      { code: '052103', module: 'role update', description: 'Same As Previous Role', severity: 'WARNING' },
      { code: '052104', module: 'role update', description: 'Role Not Found', severity: 'LOW' },
      { code: '052005', module: 'role update', description: 'Internal Server Error', severity: 'HIGH' }
    ]),
    await queryInterface.bulkInsert('color_modes', [
      { name: 'rgb' },
      { name: 'rgba' },
      { name: 'grayscale' },
      { name: 'cmyk' },
      { name: 'lab' }
    ]),
    await queryInterface.bulkInsert('normalizations', [
      { name: 'min max' },
      { name: 'zero center' }
    ]),
    await queryInterface.bulkInsert('samplings', [
      { name: 'undersample' },
      { name: 'oversample' }
    ]),
    await queryInterface.bulkInsert('augmentations', [
      { name: 'flip' },
      { name: 'rotate' },
      { name: 'gaussian blur' },
      { name: 'box blur' },
      { name: 'median blur' },
      { name: 'contrast' },
      { name: 'brightness' }
    ]),
    await queryInterface.bulkInsert('optimizers', [
      { name: 'adam' },
      { name: 'sgd' },
      { name: 'rmsprop' }
    ]),
    await queryInterface.bulkInsert('losses', [
      { name: 'sparse_categorical_crossentropy' }
    ]),
    await queryInterface.bulkInsert('models', [
      { name: 'nasnetmobile', description: 'NASNetMobile stands for Neural Architecture Search Network for Mobile. It is a neural network architecture developed using neural architecture search (NAS) techniques. NASNetMobile is designed to provide superior performance on mobile and edge devices while being efficient in terms of model size and computation. It showcases the power of automated architecture design to optimize deep learning models for specific applications.' },
      { name: 'efficientnet', description: 'EfficientNetV2B0 is a deep learning convolutional neural network architecture that belongs to the EfficientNet family. It is known for its exceptional efficiency and effectiveness in various computer vision tasks. This architecture is designed to achieve state-of-the-art performance with fewer parameters, making it a preferred choice for resource-constrained applications' },
      { name: 'mobilenet', description: 'MobileNetV3Small is part of the MobileNet series of neural network architectures. It is specifically tailored for mobile and embedded devices. This lightweight architecture is characterized by its compact design and high computational efficiency, making it suitable for real-time image and video analysis on devices with limited processing power.' }
    ]),
    await queryInterface.bulkInsert('groups', [
      { name: 'Solution Development', description: 'Software engineer developing products to sell', is_active: true, created_at: '2023-10-30 11:02:46', created_by: 1 },
      { name: 'Data Analytics', description: 'Data analysts developing products to sell', is_active: true, created_at: '2023-10-30 11:02:46', created_by: 1 }
    ]),
    await queryInterface.bulkInsert('group_members', [
      { user_id: 4, group_id: 1, is_active: true, is_admin: 0, member_since: '2023-10-30 11:02:46' },
      { user_id: 10, group_id: 1, is_active: true, is_admin: 0, member_since: '2023-10-30 11:02:46' },
      { user_id: 5, group_id: 1, is_active: true, is_admin: 1, member_since: '2023-10-30 11:02:46' },
      { user_id: 12, group_id: 1, is_active: true, is_admin: 0, member_since: '2023-10-30 11:02:46' },
      { user_id: 3, group_id: 2, is_active: true, is_admin: 0, member_since: '2023-10-30 11:02:46' },
      { user_id: 6, group_id: 2, is_active: true, is_admin: 0, member_since: '2023-10-30 11:02:46' },
      { user_id: 2, group_id: 2, is_active: true, is_admin: 1, member_since: '2023-10-30 11:02:46' },
      { user_id: 8, group_id: 2, is_active: true, is_admin: 0, member_since: '2023-10-30 11:02:46' }
    ]),
    await queryInterface.bulkInsert('projects', [
      { name: 'Winnie The Pooh', description: 'Identifying the characters in Winnie the Pooh series.', is_active: true, group_id: 2, created_at: '2023-10-30 11:02:46', created_by: 2, updated_at: '2023-11-01 14:49:05', updated_by: 2 }
    ]),
    await queryInterface.bulkInsert('project_members', [
      { user_id: 2, project_id: 1, is_active: true, last_viewed: null, member_since: '2023-10-30 11:02:46' },
      { user_id: 11, project_id: 1, is_active: true, last_viewed: null, member_since: '2023-10-30 11:02:46' },
      { user_id: 15, project_id: 1, is_active: true, last_viewed: null, member_since: '2023-10-30 11:02:46' },
      { user_id: 12, project_id: 1, is_active: true, last_viewed: null, member_since: '2023-10-30 11:02:46' }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {})
    await queryInterface.bulkDelete('users', null, {})
    await queryInterface.bulkDelete('notification_types', null, {})
    await queryInterface.bulkDelete('notification_messages', null, {})
    await queryInterface.bulkDelete('color_modes', null, {})
    await queryInterface.bulkDelete('normalizations', null, {})
    await queryInterface.bulkDelete('samplings', null, {})
    await queryInterface.bulkDelete('augmentations', null, {})
    await queryInterface.bulkDelete('optimizers', null, {})
    await queryInterface.bulkDelete('losses', null, {})
    await queryInterface.bulkDelete('models', null, {})
    await queryInterface.bulkDelete('groups', null, {})
    await queryInterface.bulkDelete('group_members', null, {})
    await queryInterface.bulkDelete('projects', null, {})
    await queryInterface.bulkDelete('project_members', null, {})
  }
}
