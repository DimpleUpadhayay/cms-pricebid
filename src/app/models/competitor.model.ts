export class competitor {
    bid_submit: string;
    bid_result: string;
    bid_winner: string;
    bid_winner_value: string;
    bid_our_value: string;
    result_date: string;
    remarks: string;
    positive_point: string[];
    new_point: string[];
    solution_component: string[];
    total : string[];
    score: string[];

    constructor() {
        this.bid_submit = '';
        this.bid_result = '';
        this.bid_winner = '';
        this.bid_winner_value = '';
        this.bid_our_value = '';
        this.result_date = '';
        this.positive_point = [];
        this.new_point = [];
        this.solution_component = [];
        this.total = [];
        this.score = [];
    }
}